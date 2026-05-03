const dotenv = require('dotenv').config;
dotenv();
const router = require('express').Router();

const { getTrending, getRecent, getByCategory, search } = require('./myinstants');

const clips = require('./testData').clips;

router.get('/', async function(req, res) {
    if (req.isTesting) {
        return res.status(200).send(clips);
    }

    try {
        const soundboardItems = await req.db.firebase.soundboard.get();
        return res.status(200).send(soundboardItems);
    } catch (e) {
        return res.status(500).send(e);
    }
});

router.get('/random', async function(req, res) {
    if (req.isTesting) {
        const randomIndex = Math.floor(Math.random() * clips.length);
        return res.status(200).send(clips[randomIndex]);
    }

    try {
        const clip = await req.db.firebase.soundboard.getRandom();
        return res.status(200).send(clip);
    } catch (e) {
        return res.status(500).send(e);
    }
});

router.get('/myinstants', async function(req, res) {
    try {
        const lang = req.query.lang;
        const countryCode = req.query.cc;
        const page = req.query.page ?? 1;
        const myinstantsRes = await getTrending(lang, countryCode, page);
        return res.status(200).send(myinstantsRes);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/myinstants/recent', async function(req, res) {
    try {
        const lang = req.query.lang;
        const page = req.query.page ?? 1;
        const myinstantsRes = await getRecent(lang, page);
        return res.status(200).send(myinstantsRes);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/myinstants/search', async function(req, res) {
    try {
        const lang = req.query.lang;
        const page = req.query.page ?? 1;
        const myinstantsRes = await search(lang, req.query.query, page);
        return res.status(200).send(myinstantsRes);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/myinstants/:category', async function(req, res) {
    try {
        const lang = req.query.lang;
        const page = req.query.page ?? 1;
        const myinstantsRes = await getByCategory(lang, req.params.category, page);
        return res.status(200).send(myinstantsRes);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post('/favorite/:id', async function(req, res) {
    if (req.isTesting) {
        return res.status(200).send({ id: req.params.id, favoritedBy: [req.user.id] });
    }

    try {
        const clip = await req.db.firebase.soundboard.toggleFavorite(req.params.id, req.user.id);
        return res.status(200).send(clip);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.put('/:id', async function(req, res) {
    if (req.isTesting) {
        return res.status(200).send(req.body);
    }

    try {
        const clip = req.body;
        await req.db.firebase.soundboard.update(clip);
        return res.status(200).send(clip);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.delete('/:id', async function(req, res) {
    if (req.isTesting) {
        return res.status(200).send("success");
    }

    try {
        const rest = await req.db.firebase.soundboard.delete(req.params.id);
        if (true) return res.status(200).send(req.params.id);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post('/add', async function(req, res) {
    if (req.isTesting) {
        return res.status(200).send("success");
    }
    
    try {
        const clip = req.body;
        await req.db.firebase.soundboard.add(clip);
        return res.status(200).send(clip);
    } catch (err) {
        return res.status(500).send(err);
    }
});

module.exports = router;