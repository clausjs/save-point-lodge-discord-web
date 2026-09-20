const fetch = require('node-fetch');

const getMember = async (userId, fetchMember = fetch) => {
    if (!process.env.DISCORD_BOT_TOKEN || !process.env.SPL_ID || !process.env.SOUNDBOARD_ROLE_ID) throw new Error('Discord member lookup is not configured.');
    const response = await fetchMember(`https://discord.com/api/v10/guilds/${process.env.SPL_ID}/members/${encodeURIComponent(userId)}`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }, timeout: 5000, size: 65536, redirect: 'error'
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Discord member lookup failed.');
    const member = await response.json();
    if (member.user?.id !== userId || !member.user?.username || !Array.isArray(member.roles)) throw new Error('Invalid member response.');
    if (!member.roles.includes(process.env.SOUNDBOARD_ROLE_ID)) return null;
    return member.user;
};

module.exports = ({ db, origin, addClip, memberLookup = getMember }) => async (req, res, next) => {
    const authorization = req.get('authorization');
    if (!authorization) return next();
    // Never fall back to a website cookie or legacy key when a bearer credential is supplied.
    res.set('Cache-Control', 'no-store');
    const token = /^Bearer (spl_ext_[a-f0-9]{32}\.[a-f0-9]{64})$/.exec(authorization)?.[1];
    if (!token) return res.status(401).send('Invalid extension credential.');
    try {
        const grant = await db.firebase.extensionAuth.authenticate(token, origin);
        if (!grant) return res.status(401).send('Extension connection expired or revoked.');
        if (req.method !== 'POST' || req.path !== '/soundboard/add') return res.status(403).send('This connection can only add clips.');
        const user = await memberLookup(grant.userId);
        if (!user) return res.status(403).send('Soundboard access required.');
        req.user = user;
        req.db = db;
        return addClip(req, res);
    } catch {
        return res.status(503).send('Could not verify extension access.');
    }
};
module.exports.getMember = getMember;
