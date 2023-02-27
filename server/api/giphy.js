const Giphy = require('@giphy/js-fetch-api');
const router = require('express').Router();
const giphy = new Giphy.GiphyFetch(process.env.GIPHY)
require('isomorphic-fetch');

router.get('/', async function(req, res) {
    const text = req.query.text ? req.query.text : 'example text';
    try {
        const gifs = await giphy.animate(text, { offset: req.query.offset });
        res.status(200).send(gifs);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;