const dotenv = require('dotenv').config;
dotenv();
const router = require('express').Router();

const { getTrending, getRecent, getByCategory, search, getUploadedByUser, getFavoritedByUser } = require('./myinstants');

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

// router.get('/:id', async function(req, res) {
//     if (req.isTesting) {
//         return res.status(200).send(clips.find(clip => clip.id === req.params.id));
//     }

//     try {
//         const soundboardItem = await req.db.firebase.soundboard.getById(req.params.id);
//         return res.status(200).send(soundboardItem);
//     } catch (e) {
//         return res.status(500).send(e);
//     }
// });

router.get('/myinstants', async function(req, res) {
    try {
        const lang = req.query.lang;
        const countryCode = req.query.cc;
        const myinstantsRes = await getTrending(lang, countryCode);
        return res.status(200).send(myinstantsRes);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/myinstants/recent', async function(req, res) {
    try {
        const lang = req.query.lang;
        const myinstantsRes = await getRecent(lang);
        return res.status(200).send(myinstantsRes);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/myinstants/search', async function(req, res) {
    try {
        const lang = req.query.lang;
        const myinstantsRes = await search(lang, req.query.query);
        return res.status(200).send(myinstantsRes);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/myinstants/:category', async function(req, res) {
    try {
        const lang = req.query.lang;
        const myinstantsRes = await getByCategory(lang, req.params.category);
        return res.status(200).send(myinstantsRes);
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

router.post('/favorite/:id', async function(req, res) {
    if (req.isTesting) {
        return res.status(200).send("success");
    }

    try {
        await req.db.firebase.toggleFavoriteSoundboardItem(req.params.id);
        return res.status(200).send();
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


// router.post('/add/file', upload.single('file'), async function(req, res) {
//     if (req.isTesting) {
//         return res.status(200).send("success");
//     }

//     try {
//         let firebaseRes;
//         const fileId = `FILE-${req.body.name}-${uuid()}`;

//         await s3.send(new PutObjectCommand({
//             Bucket: process.env.SOUNDBOARD_BUCKET_ID,
//             Key: fileId,
//             Body: req.file
//         }));
//         firebaseRes = await req.db.firebase.addSoundboardItem(fileId, req.body.name, req.body.description, req.body.tags, req.body.fileName);

//         const newClip = {
//             id: firebaseRes.id,
//             name: firebaseRes.name,
//             description: firebaseRes.description,
//             tags: firebaseRes.tags,
//             url: firebaseRes.url
//         }
        
//         return res.status(200).send(newClip);
//     } catch (err) {
//         return res.status(500).send(err);
//     }
// });

module.exports = router;