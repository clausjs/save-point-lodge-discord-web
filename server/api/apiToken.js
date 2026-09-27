const { randomBytes } = require('node:crypto');
const router = require('express').Router();

router.use(function(req, res, next) {
    res.set('Cache-Control', 'no-store');
    // A personal token must never create another credential, even alongside a cookie.
    if (req.get('authorization') || !req.isAuthenticated() || !req.user?.id) {
        return res.sendStatus(401);
    }
    if (req.method !== 'GET' && (req.get('origin') !== req.app.locals.origin || !req.session.apiTokenCsrf || req.get('x-csrf-token') !== req.session.apiTokenCsrf)) {
        return res.sendStatus(403);
    }
    next();
});

router.get('/', async function(req, res) {
    req.session.apiTokenCsrf ||= randomBytes(32).toString('hex');
    try {
        const credential = await req.db.apiTokens.get(req.user.id, req.app.locals.origin);
        return res.json({ credential, csrf: req.session.apiTokenCsrf });
    } catch {
        return res.status(503).send('Could not load API token settings.');
    }
});

router.post('/', async function(req, res) {
    try {
        const credential = await req.db.apiTokens.generate(req.user.id, req.app.locals.origin);
        return res.status(201).json(credential);
    } catch {
        return res.status(503).send('Could not generate an API token.');
    }
});

router.delete('/', async function(req, res) {
    try {
        await req.db.apiTokens.revoke(req.user.id, req.app.locals.origin);
        return res.sendStatus(204);
    } catch {
        return res.status(503).send('Could not revoke the API token.');
    }
});

module.exports = router;
