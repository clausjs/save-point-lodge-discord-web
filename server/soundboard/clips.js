const fetch = require('node-fetch');
const cheerio = require('cheerio');
const https = require('node:https');
const dns = require('node:dns');
const ipaddr = require('ipaddr.js');

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

// Pin the connection to a checked address; do not follow redirects from page imports.
const publicLookup = (hostname, options, callback) => {
    dns.lookup(hostname, { all: true }, (error, addresses) => {
        if (error) return callback(error);
        if (!addresses.length || addresses.some(({ address }) => ipaddr.process(address).range() !== 'unicast')) {
            return callback(new Error('Private network addresses are not allowed.'));
        }
        if (options.all) return callback(null, addresses);
        callback(null, addresses[0].address, addresses[0].family);
    });
};
const agent = new https.Agent({ lookup: publicLookup });
const resolveMyInstant = async (sourceUrl, fetchPage = fetch) => {
    let page;
    try { page = new URL(sourceUrl); } catch { throw invalid('Invalid Myinstants page.'); }
    if (typeof sourceUrl !== 'string' || sourceUrl.length > 2048 || page.protocol !== 'https:' || page.username || page.password || page.port
        || !['myinstants.com', 'www.myinstants.com'].includes(page.hostname)
        || !/^\/(?:[a-z]{2}\/)?instant\/[a-zA-Z0-9_-]+\/?$/.test(page.pathname) || page.search || page.hash) {
        throw invalid('Choose a Myinstants sound detail page.');
    }
    const response = await fetchPage(page.href, { agent, redirect: 'error', timeout: 5000, size: 512 * 1024 });
    if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw invalid('Could not read the sound page.');
    const $ = cheerio.load(await response.text());
    const source = $('meta[property="og:audio"]').attr('content')
        || $('#instant-page-button').attr('onclick')?.match(/play\(['"]([^'"]+)['"]/)?.[1];
    if (!source) throw invalid('No audio found on the sound page.');
    const resolved = new URL(source, page);
    if (!['myinstants.com', 'www.myinstants.com'].includes(resolved.hostname)) throw invalid('Unexpected audio host.');
    return audioUrl(resolved.href);
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
    if (body.sourceUrl !== undefined && body.url !== undefined) throw invalid('Supply one clip source.');
    const url = body.sourceUrl !== undefined ? await resolveMyInstant(body.sourceUrl) : audioUrl(body.url);
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
module.exports = { parseClip, addClip, publicLookup, resolveMyInstant };
