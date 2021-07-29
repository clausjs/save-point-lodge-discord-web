const router = require('express').Router();

const testData = require('./testData').commands;

router.get('/', async function(req, res) {
    try {
        if (req.isTesting) {
            console.log('returning static json', req.isTesting);
            const slowResponse = setTimeout(() => {
                clearTimeout(slowResponse);
                res.status(200).send(testData);
            }, 5000);
            return 
        }

        console.log('making network request for commands');
        const commands = await req.db.firebase.getCommands();
        return res.status(200).send(commands);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;