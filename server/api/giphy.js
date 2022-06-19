const dotenv = require('dotenv').config();
const Giphy = require('@giphy/js-fetch-api');
const router = require('express').Router();
const giphy = new Giphy.GiphyFetch(process.env.GIPHY)
require('isomorphic-fetch');

router.get('/', async function(req, res) {
    try {
        const gifs = await giphy.animate("example text", { offset: req.body.offset });
        res.status(200).send(gifs);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;