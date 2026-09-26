const { randomBytes } = require('node:crypto');
const router = require('express').Router;

module.exports = ({ tokens, origin }) => {
    const routes = router();
    routes.use((req, res, next) => {
        res.set('Cache-Control', 'no-store');
        // A personal token must never create another credential, even alongside a cookie.
        if (req.get('authorization') || !req.isAuthenticated() || !req.user?.id) return res.sendStatus(401);
        if (req.method !== 'GET' && (req.get('origin') !== origin || !req.session.apiTokenCsrf || req.get('x-csrf-token') !== req.session.apiTokenCsrf)) return res.sendStatus(403);
        next();
    });
    routes.get('/', async (req, res) => {
        req.session.apiTokenCsrf ||= randomBytes(32).toString('hex');
        try { res.json({ credential: await tokens.get(req.user.id, origin), csrf: req.session.apiTokenCsrf }); }
        catch { res.status(503).send('Could not load API token settings.'); }
    });
    routes.post('/', async (req, res) => {
        try { res.status(201).json(await tokens.generate(req.user.id, origin)); }
        catch { res.status(503).send('Could not generate an API token.'); }
    });
    routes.delete('/', async (req, res) => {
        try { await tokens.revoke(req.user.id, origin); res.sendStatus(204); }
        catch { res.status(503).send('Could not revoke the API token.'); }
    });
    return routes;
};
