const dotenv = require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const router = require('express').Router();
const os = require('os');
const multer  = require('multer');
const upload = multer({ dest: os.tmpdir() });
const uuid = require('uuid').v4();

const clips = require('./testData').clips;

const devMode = process.env.NODE_ENV === 'dev';

let s3;
if (!devMode) {
    s3 = new S3Client({
        endpoint: 'https://s3.us-east-005.backblazeb2.com',
        region: 'us-east-005',
        credentials: {
            accessKeyId: process.env.BACKBLAZE_ACCESS_KEY_ID,
            secretAccessKey: process.env.BACKBLAZE_SECRET_ACCESS_KEY
        }
    });
}

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

router.get('/:id', async function(req, res) {
    if (req.isTesting) {
        return res.status(200).send(clips.find(clip => clip.id === req.params.id));
    }

    try {
        const soundboardItem = await req.db.firebase.soundboard.get(req.params.id);
        return res.status(200).send(soundboardItem);
    } catch (e) {
        return res.status(500).send(e);
    }
});

// router.get('/play/:id', async function(req, res) {
//     if (req.isTesting) {
//         const clip = clips.find(clip => clip.id === req.params.id);
//         if (clip) {
//             wsClient.playSound(clip.url);
//             return res.status(200).send(clip);
//         }
//     }

//     try {
//         const soundboardItem = await req.db.firebase.soundboard.get(req.params.id);
//         // wsClient.playSound(soundboardItem.url);
//     } catch (e) {
//         return res.status(500).send(e);
//     }
// });

router.post('/:id', async function(req, res) {
    if (req.isTesting) {
        return res.status(200).send(req.body);
    }

    try {
        const clip = req.body;
        await req.db.firebase.soundboard.set({ ...clip, id: req.params.id });
        return res.status(200).send();
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

router.delete('/delete/:id', async function(req, res) {
    if (req.isTesting) {
        return res.status(200).send("success");
    }

    try {
        if (req.params.id.indexOf('URL') === -1) {
            await s3.send(new DeleteObjectCommand({
                Bucket: process.env.SOUNDBOARD_BUCKET_ID,
                Key: req.params.id
            }));
        }
        await req.db.firebase.soundboard.delete(req.params.id);
        return res.status(200).send();
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post('/add', async function(req, res) {
    console.log("req.body: ", req.body, typeof req.body);
    if (req.isTesting) {
        return res.status(200).send("success");
    }

    try {
        const clip = JSON.parse(req.body.clip);
        let firebaseRes = await req.db.firebase.add(`URL-${uuid()}`, clip.name, clip.description, clip.tags, clip.url);
        // if (req.body.type === "url") {
        // } else if (req.body.type === "file") {
        //     const bucketRes = await s3.send(new PutObjectCommand({
        //         Bucket: process.env.SOUNDBOARD_BUCKET_ID,
        //         Key: req.body.name,
        //         Body: req.file
        //     }));
        //     firebaseRes = await req.db.firebase.addSoundboardItem(bucketRes.ChecksumSHA1, req.body.name, req.body.description, req.body.tags, req.body.fileName);
        // }
        
        return res.status(200).send(firebaseRes);
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
//         if (req.body.type === "url") {
//             firebaseRes = await req.db.firebase.addSoundboardItem(`URL-${uuid()}`, req.body.name, req.body.description, req.body.tags, req.body.url);
//         } else if (req.body.type === "file") {
//             const bucketRes = await s3.send(new PutObjectCommand({
//                 Bucket: process.env.SOUNDBOARD_BUCKET_ID,
//                 Key: req.body.name,
//                 Body: req.file
//             }));
//             firebaseRes = await req.db.firebase.addSoundboardItem(bucketRes.ChecksumSHA1, req.body.name, req.body.description, req.body.tags, req.body.fileName);
//         }
        
//         return res.status(200).send(firebaseRes);
//     } catch (err) {
//         return res.status(500).send(err);
//     }
// });

module.exports = router;