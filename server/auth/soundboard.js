// Legacy tokens/API keys identify neither a website session nor a scoped write grant.
module.exports = origin => (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (!req.isAuthenticated() || !req.user?.id) return res.status(401).send('Sign in to change soundboard clips.');
    if (req.user.isSoundboardUser !== true) return res.status(403).send('Soundboard access required.');
    // Browsers send Origin on mutations. Reject missing/foreign origins, including sibling environments.
    if (req.get('origin') !== origin) return res.status(403).send('Invalid request origin.');
    next();
};
