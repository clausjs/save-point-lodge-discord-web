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
    return { ...member.user, isPlanetExpressMember: true, isSoundboardUser: member.roles.includes(process.env.SOUNDBOARD_ROLE_ID) };

};

module.exports = getMember;
