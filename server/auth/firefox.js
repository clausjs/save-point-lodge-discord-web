const { createHash, randomBytes } = require('node:crypto');
const express = require('express');

// Firefox derives this callback from the signed add-on ID, not a caller-supplied host.
const extensionId = 'soundboard-browser-extension@savepointlodge.com';
const redirectUri = `https://${createHash('sha1').update(extensionId).digest('hex')}.extensions.allizom.org/`;
const lifetime = 5 * 60 * 1000;

module.exports = ({ db }) => {
    const router = express.Router();
    router.use((req, res, next) => {
        res.set({
            'Cache-Control': 'no-store',
            'Referrer-Policy': 'no-referrer',
            'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
            'X-Frame-Options': 'DENY'
        });
        next();
    });

    router.get('/', (req, res) => {
        const { redirect_uri, state } = req.query;
        if (redirect_uri !== redirectUri || typeof state !== 'string' || !/^[a-f0-9]{64}$/.test(state)) {
            return res.status(400).send('Invalid extension login request. Start again from Firefox settings.');
        }
        req.session.firefoxAuth = {
            state,
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
<p>Give the Savepoint Lodge Soundboard extension access to the soundboard as <strong>${username}</strong>?</p>
<p>This shares your existing soundboard token, also used by Stream Deck. Removing it from Firefox does not revoke it on the server.</p>
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
                    const { token } = await db.firebase.streamdeck.get(req.user.id);
                    if (typeof token !== 'string' || !token) throw new Error('Missing soundboard token');
                    result.set('token', token);
                } catch {
                    return res.status(503).send('Could not retrieve your soundboard token. Start again from Firefox settings.');
                }
            }
            // Firefox intercepts this fixed URL. The fragment is not sent in an HTTP request.
            res.status(303).set('Location', `${redirectUri}#${result}`).end();
        });
    });
    return router;
};

module.exports.redirectUri = redirectUri;
