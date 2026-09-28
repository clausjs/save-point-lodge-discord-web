const getMember = require('./discordMember');

// Authentication only: route policies decide what this identity can do.
const bearer = ({ db, origin, memberLookup = getMember }) => async (req, res, next) => {
    const authorization = req.get('authorization');
    if (!authorization) return next();
    res.set('Cache-Control', 'no-store');
    const token = /^Bearer (\S+)$/i.exec(authorization)?.[1];
    const kind = token?.startsWith('spl_api_') ? 'personal' : 'extension';
    if (!token || !/^spl_(?:api_[a-f0-9]{64}|ext_[a-f0-9]{32})\.[a-f0-9]{64}$/.test(token)) return res.status(401).send('Invalid bearer credential.');
    try {
        const store = kind === 'personal' ? db.apiTokens : db.extensionAuth;
        const grant = await store.authenticate(token, origin);
        if (!grant) return res.status(401).send('Token expired or revoked.');
        const user = await memberLookup(grant.userId);
        if (!user) return res.status(403).send('SPL membership required.');
        req.auth = { kind, scope: grant.scope };
        req.user = user;
        req.db = db;
    } catch {
        return res.status(503).send('Could not verify bearer access.');
    }
    // Do not mark this as a Passport login or fall back to a cookie on failure.
    next();
};

module.exports = bearer;
