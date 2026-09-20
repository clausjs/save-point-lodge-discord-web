
function invalid(message) {
    throw Object.assign(new Error(message), { status: 400 });
}

function isText(value, max, fallback) {
    if (value === undefined && fallback !== undefined) return fallback;
    if (typeof value !== 'string' || !value.trim() || value.length > max) invalid('Invalid clip text.');
    return value.trim();
}

function isAudioUrl(value) {
    let url;
    try { url = new URL(value); } catch { invalid('Invalid audio URL.'); }
    if (typeof value !== 'string' || value.length > 2048 || url.protocol !== 'https:' || url.username || url.password || url.port
        || !isValidHost(url.hostname) || !/\.(mp3|ogg|wav)$/i.test(url.pathname) || url.hash) {
        invalid('Use an HTTPS audio URL from an approved sound host.');
    }
    return url.href;
}

function isValidHost(host) {
    return ['myinstants.com', 'www.myinstants.com', ...(process.env.SOUNDBOARD_AUDIO_HOSTS || '').split(',').filter(Boolean)].includes(host);
}

function parseClip(clip) {
    if (!clip || typeof clip !== 'object' || Array.isArray(clip)) invalid('Invalid clip.');
    const name = isText(clip.name, 200);
    const description = clip.description === '' ? '' : isText(clip.description, 2000, '');
    const category = isText(clip.category, 100, 'Uncategorized');
    const tags = clip.tags ?? [];
    if (!Array.isArray(tags) || tags.length > 20) invalid('Invalid tags.');
    const normalizedTags = tags.map(tag => isText(tag, 50).toLowerCase());
    const volume = clip.volume ?? 50;
    if (typeof volume !== 'number' || !Number.isFinite(volume) || volume < 0 || volume > 100) invalid('Invalid volume.');
    if (clip.sourceUrl !== undefined) invalid('Supply a direct audio URL.');
    const url = isAudioUrl(clip.url);
    return { name, url, description, category, tags: normalizedTags, volume };
}

const addClip = async (req, res) => {
    try {
        const clip = { ...parseClip(req.body), uploadedBy: req.user.username || req.user.id };
        if (!req.isTesting) await req.db.firebase.soundboard.add(clip);
        return res.status(200).json(clip);
    } catch (error) {
        return res.status(error.status || 502).send(error.status === 400 ? error.message : 'Could not save the clip.');
    }
};
module.exports = { parseClip, addClip };
