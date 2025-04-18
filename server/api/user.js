const { reduceUser } = require('../auth/utils');

const router = require('express').Router();

router.get('/', function(req, res) {
    if (req.isAuthenticated() && req.user) {
        return res.status(200).json(reduceUser(req.user));
    }

    res.status(200).json(null);
});

router.get('/opts', async function(req, res) {
    try {
        const userOpts = await req.db.firebase.userOpts.get(req.user.id);
        res.status(200).send(userOpts);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/soundboard/opts', async function(req, res) {
    try {
        const soundboardOpts = await req.db.firebase.soundboardOpts.get(req.user.id);
        res.status(200).send(soundboardOpts);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/opts', async function(req, res) {
    try {
        await req.db.firebase.userOpts.set(req.user.id, req.body);
        res.status(200).send(req.body);
    } catch (err) {
        console.error("err: ", err);
        res.status(500).send(err);
    }
});

router.post('/soundboard/opts', async function(req, res) {
    try {
        await req.db.firebase.soundboardOpts.set(req.user.id, req.body);
        res.status(200).send(req.body);
    } catch (err) {
        console.error("err: ", err);
        res.status(500).send(err);
    }
}); 

router.get('/soundboarder', function(req, res) {
    if (req.isTesting || req.fakeAuth) return res.status(200).send(true);
    
    if (req.isAuthenticated() && req.user) {
        return res.status(200).send(req.user.isSoundboardUser);
    }

    res.status(200).send(false);
});

router.get('/lodgeguest', function(req, res) {
    if (req.isTesting) return res.status(200).send(true);
    if (req.isAuthenticated() && req.user) {
        return res.status(200).send(req.user.isPlanetExpressMember);
    }

    res.status(200).send(false);
});

module.exports = router;