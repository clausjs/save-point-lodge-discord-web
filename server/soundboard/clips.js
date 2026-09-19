const invalid = message => Object.assign(new Error(message), { status: 400 });
const text = (value, max, fallback) => {
    if (value === undefined && fallback !== undefined) return fallback;
    if (typeof value !== 'string' || !value.trim() || value.length > max) throw invalid('Invalid clip text.');
    return value.trim();
};
const mediaHosts = () => ['myinstants.com', 'www.myinstants.com', ...(process.env.SOUNDBOARD_AUDIO_HOSTS || '').split(',').filter(Boolean)];
const audioUrl = value => {
    let url;
    try { url = new URL(value); } catch { throw invalid('Invalid audio URL.'); }
    if (typeof value !== 'string' || value.length > 2048 || url.protocol !== 'https:' || url.username || url.password || url.port
        || !mediaHosts().includes(url.hostname) || !/\.(mp3|ogg|wav)$/i.test(url.pathname) || url.hash) {
        throw invalid('Use an HTTPS audio URL from an approved sound host.');
    }
    return url.href;
};

const parseClip = async body => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw invalid('Invalid clip.');
    const name = text(body.name, 200);
    const description = body.description === '' ? '' : text(body.description, 2000, '');
    const category = text(body.category, 100, 'Uncategorized');
    const tags = body.tags ?? [];
    if (!Array.isArray(tags) || tags.length > 20) throw invalid('Invalid tags.');
    const normalizedTags = tags.map(tag => text(tag, 50).toLowerCase());
    const volume = body.volume ?? 50;
    if (typeof volume !== 'number' || !Number.isFinite(volume) || volume < 0 || volume > 100) throw invalid('Invalid volume.');
    if (body.sourceUrl !== undefined) throw invalid('Supply a direct audio URL.');
    const url = audioUrl(body.url);
    return { name, url, description, category, tags: normalizedTags, volume };
};
const addClip = async (req, res) => {
    try {
        const clip = { ...await parseClip(req.body), uploadedBy: req.user.username || req.user.id };
        if (!req.isTesting) await req.db.firebase.soundboard.add(clip);
        return res.status(200).json(clip);
    } catch (error) {
        return res.status(error.status || 502).send(error.status === 400 ? error.message : 'Could not save the clip.');
    }
};
module.exports = { parseClip, addClip };
