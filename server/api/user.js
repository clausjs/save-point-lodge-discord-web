const router = require('express').Router();

router.get('/', function(req, res) {
    if (req.isTesting) {
        const simplifiedUser = {
            id: process.env.OWNER_ID,
            username: 'testUser',
            avatarUrl: 'https://cdn-icons-png.freepik.com/512/147/147142.png'
        }
        return res.status(200).json(simplifiedUser);
    }

    if (req.isAuthenticated() && req.user) {
        const simplifiedUser = {
            id: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar
        }
        return res.status(200).json(simplifiedUser);
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

router.post('/opts', async function(req, res) {
    try {
        await req.db.firebase.userOpts.set(req.user.id, req.body);
        res.status(200).send(req.body);
    } catch (err) {
        console.error("err: ", err);
        res.status(500).send(err);
    }
});

router.get('/soundboarder', function(req, res) {
    if (req.isTesting) return res.status(200).send(true);
    
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