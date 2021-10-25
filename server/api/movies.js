const router = require('express').Router();

const { votes, stats } = require('./testData');

router.get('/vote', async function(req, res) {
    try {
        if (req.isTesting) {
            console.log('returning static json', req.isTesting);
            return res.status(200).send(votes);
        }

        const movies = await req.db.firebase.getUnvotedMovies(req.user.id);
        res.status(200).send(movies);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.post('/vote', async function(req, res) {
    try {
        await req.db.firebase.addVote(req.user.id, req.body.movieId);
        const newMovies = await req.db.firebase.getUnvotedMovies(req.user.id);
        res.status(200).send(newMovies);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/movie-stats', async function(req, res) {
    try {
        if (req.isTesting) {
            console.log('returning static json', req.isTesting);
            return res.status(200).send(stats);
        }

        const movieStats = await req.db.firebase.getVotedMovieStatistics(req.user.id);
        res.status(200).send(movieStats);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;