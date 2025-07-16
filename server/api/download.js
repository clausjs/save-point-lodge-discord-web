const router = require('express').Router();
const fs = require('fs');
const http = require('request');

const downloadFileAndRemove = (res, filePath) => {
    res.download(filePath, (err) => {
        if (!err) {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting file after download:", unlinkErr);
                }
            });
            return;
        }
    });
}

router.get('/clip/:filename', async function(req, res) {
    const filename = req.params.filename;
    const basePath = Boolean(process.env.USE_DOCKER_PATHS) ? '/data' : `${process.cwd()}`;
    const path = `${basePath}/public/downloads/clips/`;
    const filePath = `${path}${filename}.mp3`;

    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
        console.log("File already exists, sending:", filePath);
        return downloadFileAndRemove(res, filePath);
    }
    
    try {
        const url = `https://myinstants.com/media/sounds/${filename}.mp3`;

        await new Promise((resolve, reject) => {
            http(url)
                .pipe(fs.createWriteStream(filePath))
                .on('finish', () => {
                    console.log("Download completed successfully.");
                    resolve();
                })
                .on('error', (err) => {
                    console.error("Error during download:", err);
                    reject(err);
                });
        });

        downloadFileAndRemove(res, filePath);
    } catch (err) {
        console.error("Error downloading clip:", err);
        return res.status(500).send("Error downloading clip");
    }
});

module.exports = router;