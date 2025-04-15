const router = require('express').Router();

const fetchDiscordInfo = async () => {
    try {
        const res = await fetch(`https://ptb.discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/widget.json`);
        const discordInfo = await res.json();
        return discordInfo;
    } catch (err) {
        throw new Error("Unable to fetch discord widget data.");
    }
}

router.get('/members', async function(req, res) {
    try {
        const discordInfo = await fetchDiscordInfo();
        return res.status(200).send(discordInfo.members);
    } catch (err) {
        res.status(500).send(new Error("Unable to fetch discord widget data."));
    }
});

module.exports = router;