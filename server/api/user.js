const router = require('express').Router();

const sendSuccess = (res, payload, isJson = false) => {
    if (isJson) return res.status(200).json(payload);
    return res.status(200).send(payload)
}

const sendError = (res, status, err) => {
    return res.status(status).send(err);
}

const send401 = (res) => {
    return res.status(401).send('Not authenticated');
}

router.get('/', function(req, res) {
    if (req.isAuthenticated() && req.user) {
        const simplifiedUser = {
            id: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar,
            isPlanetExpressMember: req.user.isPlanetExpressMember,
            isMoviegoer: req.user.isMoviegoer
        }
        return res.status(200).json(simplifiedUser);
    }
    res.status(200).json(null);
});

router.get('/opts/descriptions', async function(req, res) {
    try {
        const descriptions = await req.db.userdata.getOptionsDescriptions();
        res.status(200).send(descriptions);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/opts', async function(req, res) {
    try {
        const userOpts = await req.db.userdata.getUserOptions(req.user.id);
        res.status(200).send(userOpts);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/opts', async function(req, res) {
    try {
        await req.db.userdata.setUserOptions(req.body);
        res.status(200).send(req.body);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;