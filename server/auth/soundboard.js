// Legacy tokens/API keys identify neither a website session nor a scoped write grant.
const soundboard = origin => (req, res, next) => {
    if (req.method === 'GET') return next();
    if ((!req.auth && !req.isAuthenticated()) || !req.user?.id) return res.status(401).send('Sign in to change soundboard clips.');
    if (req.user.isSoundboardUser !== true) return res.status(403).send('Soundboard access required.');
    // Cookie mutations require a matching Origin; bearer requests are authorized by route scope.
    if (!req.auth && req.get('origin') !== origin) return res.status(403).send('Invalid request origin.');
    next();
};

module.exports = soundboard;
