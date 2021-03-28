const router = require('express').Router();

router.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        return res.status(200).json(req.user);
    }
    res.status(500).send("Not authenticated");
});

router.get('/opts/descriptions', async function(req, res) {
    try {
        const descriptions = await req.db.userdata.getOptionsDescriptions();
        res.status(200).send(descriptions);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.get('/opts', async function(req, res) {
    try {
        const userOpts = await req.db.userdata.getUserOptions(req.user.id);
        res.status(200).send(userOpts);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.post('/opts', async function(req, res) {
    try {
        await req.db.userdata.setUserOptions(req.body);
        res.status(200).send(req.body);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.get('/vote', async function(req, res) {
    try {
        const movies = await req.db.userdata.getUnvotedMovies();
        res.status(200).send(movies);
    } catch(err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.post('/vote', async function(req, res) {
    try {
        const newMovies = await req.db.userdata.addVote(req.body.movieId);
        res.status(200).send(newMovies);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

module.exports = router;