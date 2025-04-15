const router = require('express').Router();

const testData = require('./testData').commands;

router.get('/', async function(req, res) {
    try {
        let commands;
        if (req.isTesting) {
            console.log('returning static json', req.isTesting);
            commands = await new Promise(async (resolve) => {
                const slowResponse = setTimeout(() => {
                    clearTimeout(slowResponse);
                    resolve(testData);
                }, 5000);
            });
        } else {
            commands = await req.db.firebase.commands.get();
        }
        const filteredCommands = commands.filter(command => !command.private && command.type === 1);

        return res.status(200).send(filteredCommands);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;