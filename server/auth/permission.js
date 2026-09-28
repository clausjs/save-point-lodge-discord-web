// Session/API-key behavior is unchanged. Bearer credentials need an explicit route scope.
const permission = (...scopes) => (req, res, next) => {
    if (req.auth && !scopes.includes(req.auth.scope)) return res.status(403).send('Token does not permit this operation.');
    next();
};

module.exports = permission;
