const { createHash, randomBytes } = require('node:crypto');
const express = require('express');

// Firefox derives this callback from the signed add-on ID, not a caller-supplied host.
const extensionId = 'soundboard-browser-extension@savepointlodge.com';
const redirectUri = `https://${createHash('sha1').update(extensionId).digest('hex')}.extensions.allizom.org/`;
const lifetime = 5 * 60 * 1000;

module.exports = ({ db, origin }) => {
    const router = express.Router();
    router.use((req, res, next) => {
        res.set({
            'Cache-Control': 'no-store',
            'Referrer-Policy': 'no-referrer',
            'Content-Security-Policy': `default-src 'none'; form-action 'self' ${redirectUri}; frame-ancestors 'none'; base-uri 'none'`,
            'X-Frame-Options': 'DENY'
        });
        next();
    });

    router.post('/token', async (req, res) => {
        const { grant_type, code, code_verifier, redirect_uri } = req.body;
        if (grant_type !== 'authorization_code' || redirect_uri !== redirectUri || typeof code !== 'string' || typeof code_verifier !== 'string') {
            return res.status(400).json({ error: 'invalid_request' });
        }
        try {
            const result = await db.firebase.extensionAuth.exchange(code, code_verifier, redirect_uri, origin);
            return result ? res.json(result) : res.status(400).json({ error: 'invalid_grant' });
        } catch {
            return res.status(503).json({ error: 'temporarily_unavailable' });
        }
    });

    router.post('/revoke', async (req, res) => {
        const token = /^Bearer (spl_ext_[a-f0-9]{32}\.[a-f0-9]{64})$/.exec(req.get('authorization') || '')?.[1];
        if (!token) return res.sendStatus(401);
        try {
            const grant = await db.firebase.extensionAuth.authenticate(token, origin);
            if (grant) await db.firebase.extensionAuth.revoke(grant.id, grant.userId, origin);
            return res.sendStatus(204);
        } catch {
            return res.sendStatus(503);
        }
    });

    // Account-owned revocation works even if the extension or device is no longer available.
    router.get('/connections', async (req, res) => {
        if (!req.isAuthenticated() || !req.user?.id) {
            req.session.firefoxConnections = true;
            return res.redirect('/login-discord');
        }
        req.session.extensionCsrf = randomBytes(32).toString('hex');
        try {
            const grants = await db.firebase.extensionAuth.list(req.user.id, origin);
            const forms = grants.map(grant => `<form method="post" action="/login-extension/connections">
<input type="hidden" name="csrf" value="${req.session.extensionCsrf}"><input type="hidden" name="id" value="${grant.id}">
<button>Revoke Firefox connection (expires ${new Date(grant.expiresAt).toISOString()})</button></form>`).join('');
            return res.type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Firefox connections</title></head><body><h1>Firefox connections</h1>${forms || '<p>No active connections.</p>'}</body></html>`);
        } catch {
            return res.status(503).send('Could not load connections.');
        }
    });
    router.post('/connections', async (req, res) => {
        if (!req.isAuthenticated() || !req.user?.id || !req.session.extensionCsrf || req.body.csrf !== req.session.extensionCsrf) return res.sendStatus(403);
        try {
            await db.firebase.extensionAuth.revoke(req.body.id, req.user.id, origin);
            return res.redirect(303, '/login-extension/connections');
        } catch {
            return res.sendStatus(503);
        }
    });

    router.get('/', (req, res) => {
        const { redirect_uri, state, code_challenge, code_challenge_method } = req.query;
        if (redirect_uri !== redirectUri || typeof state !== 'string' || !/^[a-f0-9]{64}$/.test(state)
            || code_challenge_method !== 'S256' || typeof code_challenge !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(code_challenge)) {
            return res.status(400).send('Invalid extension login request. Start again from Firefox settings.');
        }
        req.session.firefoxAuth = {
            state,
            challenge: code_challenge,
            csrf: randomBytes(32).toString('hex'),
            expiresAt: Date.now() + lifetime
        };
        res.redirect(req.isAuthenticated() ? '/login-extension/confirm' : '/login-discord');
    });

    router.use((req, res, next) => {
        if (!req.session.firefoxAuth || req.session.firefoxAuth.expiresAt <= Date.now()) {
            delete req.session.firefoxAuth;
            return res.status(400).send('Extension login expired. Start again from Firefox settings.');
        }
        if (!req.isAuthenticated() || !req.user?.id) {
            return res.status(401).send('Sign in to Savepoint Lodge before connecting Firefox.');
        }
        next();
    });

    router.get('/confirm', (req, res) => {
        if (req.user.isSoundboardUser !== true) {
            delete req.session.firefoxAuth;
            return res.status(403).send('Your Discord account does not have soundboard access.');
        }
        // The form contains only a session-bound nonce. Credentials never enter page HTML or scripts.
        const username = String(req.user.username || 'your account').replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[character]));
        res.type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Connect Firefox to Savepoint Lodge</title></head>
<body><main><h1>Connect Firefox</h1>
<p>Allow the Savepoint Lodge Firefox extension to add clips as <strong>${username}</strong>?</p>
<p>This connection can only add clips, expires in 15 minutes, and can be revoked independently. It cannot edit, delete, or play clips.</p>
<form method="post" action="/login-extension/confirm">
<input type="hidden" name="csrf" value="${req.session.firefoxAuth.csrf}">
<button name="decision" value="allow">Connect Firefox</button>
<button name="decision" value="deny">Cancel</button>
</form></main></body></html>`);
    });

    router.post('/confirm', async (req, res) => {
        const pending = req.session.firefoxAuth;
        if (req.body.csrf !== pending.csrf || !['allow', 'deny'].includes(req.body.decision)) {
            return res.status(403).send('Invalid confirmation. Start again from Firefox settings.');
        }
        if (req.user.isSoundboardUser !== true) {
            delete req.session.firefoxAuth;
            return res.status(403).send('Your Discord account does not have soundboard access.');
        }
        delete req.session.firefoxAuth;
        // Save consumption before redirecting so a refresh cannot repeat the handoff.
        req.session.save(async (error) => {
            if (error) return res.status(500).send('Could not complete extension login. Please try again.');
            const result = new URLSearchParams({ state: pending.state });
            if (req.body.decision === 'deny') {
                result.set('error', 'access_denied');
            } else {
                try {
                    const code = await db.firebase.extensionAuth.issueCode({ userId: req.user.id, challenge: pending.challenge, redirectUri, audience: origin });
                    result.set('code', code);
                } catch {
                    return res.status(503).send('Could not authorize Firefox. Start again from Firefox settings.');
                }
            }
            // Only a short-lived PKCE-bound code enters the fixed callback; never an access token.
            res.status(303).set('Location', `${redirectUri}?${result}`).end();
        });
    });
    return router;
};

module.exports.redirectUri = redirectUri;
