const router = require('express').Router();

const { votes, stats } = require('./testData');

router.get('/vote', async function(req, res) {
    try {
        if (req.isTesting) {
            console.log('returning static json', req.isTesting);
            return res.status(200).send(votes);
        }

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

router.get('/movie-stats', async function(req, res) {
    try {
        if (req.isTesting) {
            console.log('returning static json', req.isTesting);
            return res.status(200).send(stats);
        }

        const movieStats = await req.db.userdata.getVotedMovieStatistics();
        res.status(200).send(movieStats);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

module.exports = router;