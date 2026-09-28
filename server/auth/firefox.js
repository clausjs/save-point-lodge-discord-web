const { createHash, randomBytes } = require('node:crypto');
const router = require('express').Router();

// Firefox derives this callback from the signed add-on ID, not a caller-supplied host.
const extensionId = 'soundboard-browser-extension@savepointlodge.com';
const redirectUri = `https://${createHash('sha1').update(extensionId).digest('hex')}.extensions.allizom.org/`;
const lifetime = 5 * 60 * 1000;

router.use(function(req, res, next) {
    res.set({
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': `default-src 'none'; form-action 'self' ${redirectUri}; frame-ancestors 'none'; base-uri 'none'`,
        'X-Frame-Options': 'DENY'
    });
    next();
});

// These background-only endpoints use credentials, not the browser session cookie.
// Keep them before the middleware that requires a pending interactive approval.
router.post('/token', async function(req, res) {
    const { grant_type, code, code_verifier, redirect_uri, refresh_token } = req.body;
    const refreshing = grant_type === 'refresh_token';
    const valid = refreshing ? typeof refresh_token === 'string'
        : grant_type === 'authorization_code' && redirect_uri === redirectUri && typeof code === 'string' && typeof code_verifier === 'string';
    if (!valid) {
        return res.status(400).json({ error: 'invalid_request' });
    }
    try {
        const result = refreshing
            ? await req.db.extensionAuth.refresh(refresh_token, req.app.locals.origin)
            : await req.db.extensionAuth.exchange(code, code_verifier, redirect_uri, req.app.locals.origin);
        return result ? res.json(result) : res.status(400).json({ error: 'invalid_grant' });
    } catch {
        return res.status(503).json({ error: 'temporarily_unavailable' });
    }
});

router.post('/revoke', async function(req, res) {
    const refresh = /^Bearer (spl_refresh_[a-f0-9]{32}\.[a-f0-9]{64})$/.exec(req.get('authorization') || '')?.[1];
    if (refresh) {
        try {
            await req.db.extensionAuth.revokeRefresh(refresh, req.app.locals.origin);
            return res.sendStatus(204);
        } catch {
            return res.sendStatus(503);
        }
    }
    const token = /^Bearer (spl_ext_[a-f0-9]{32}\.[a-f0-9]{64})$/.exec(req.get('authorization') || '')?.[1];
    if (!token) {
        return res.sendStatus(401);
    }
    try {
        const grant = await req.db.extensionAuth.authenticate(token, req.app.locals.origin);
        if (grant) {
            await req.db.extensionAuth.revoke(grant.id, grant.userId, req.app.locals.origin);
        }
        return res.sendStatus(204);
    } catch {
        return res.sendStatus(503);
    }
});

// Account-owned revocation works even if the extension or device is no longer available.
router.get('/connections', async function(req, res) {
    if (!req.isAuthenticated() || !req.user?.id) {
        req.session.firefoxConnections = true;
        return res.redirect('/login-discord');
    }
    return res.redirect('/settings');
});

router.get('/connections/data', async function(req, res) {
    if (req.get('authorization') || !req.isAuthenticated() || !req.user?.id) {
        return res.sendStatus(401);
    }
    req.session.extensionCsrf ||= randomBytes(32).toString('hex');
    try {
        const connections = await req.db.extensionAuth.list(req.user.id, req.app.locals.origin);
        return res.json({ connections, csrf: req.session.extensionCsrf });
    } catch {
        return res.status(503).send('Could not load connections.');
    }
});
router.post('/connections', async function(req, res) {
    if (req.get('authorization') || req.get('origin') !== req.app.locals.origin || !req.isAuthenticated() || !req.user?.id || !req.session.extensionCsrf || req.body.csrf !== req.session.extensionCsrf) {
        return res.sendStatus(403);
    }
    try {
        await req.db.extensionAuth.revoke(req.body.id, req.user.id, req.app.locals.origin);
        return res.sendStatus(204);
    } catch {
        return res.sendStatus(503);
    }
});

router.get('/', function(req, res) {
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

// Everything below belongs to the short-lived, session-bound consent flow.
router.use(function(req, res, next) {
    if (!req.session.firefoxAuth || req.session.firefoxAuth.expiresAt <= Date.now()) {
        delete req.session.firefoxAuth;
        return res.status(400).send('Extension login expired. Start again from Firefox settings.');
    }
    if (!req.isAuthenticated() || !req.user?.id) {
        return res.status(401).send('Sign in to Savepoint Lodge before connecting Firefox.');
    }
    next();
});

router.get('/confirm', function(req, res) {
    if (req.user.isSoundboardUser !== true) {
        delete req.session.firefoxAuth;
        return res.status(403).send('Your Discord account does not have soundboard access.');
    }
    return res.redirect('/extension-consent');
});

router.get('/consent', function(req, res) {
    if (req.get('authorization') || req.user.isSoundboardUser !== true) {
        return res.sendStatus(403);
    }
    // Only display data and the session-bound nonce reach React, never grant credentials.
    return res.json({ username: req.user.username, csrf: req.session.firefoxAuth.csrf });
});

router.post('/confirm', async function(req, res) {
    const pending = req.session.firefoxAuth;
    if (req.body.csrf !== pending.csrf || !['allow', 'deny'].includes(req.body.decision)) {
        return res.status(403).send('Invalid confirmation. Start again from Firefox settings.');
    }
    if (req.user.isSoundboardUser !== true) {
        delete req.session.firefoxAuth;
        return res.status(403).send('Your Discord account does not have soundboard access.');
    }
    delete req.session.firefoxAuth;
    // Persist removal of the pending approval before issuing the code. Code exchange
    // also checks this stored SPL session, so it must be saved before the redirect.
    req.session.save(async (error) => {
        if (error) {
            return res.status(500).send('Could not complete extension login. Please try again.');
        }
        const result = new URLSearchParams({ state: pending.state });
        if (req.body.decision === 'deny') {
            result.set('error', 'access_denied');
        } else {
            try {
                const code = await req.db.extensionAuth.issueCode({ userId: req.user.id, sessionId: req.sessionID, challenge: pending.challenge, redirectUri, audience: req.app.locals.origin });
                result.set('code', code);
            } catch {
                return res.status(503).send('Could not authorize Firefox. Start again from Firefox settings.');
            }
        }
        // Only a short-lived PKCE-bound code enters the fixed callback; never an access token.
        res.status(303).set('Location', `${redirectUri}?${result}`).end();
    });
});
router.redirectUri = redirectUri;

module.exports = router;
