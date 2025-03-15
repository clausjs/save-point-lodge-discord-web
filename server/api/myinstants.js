const fetch = require('node-fetch');
const uuid = require('uuid').v4;
const cheerio = require('cheerio');

const BASE_URL = "https://www.myinstants.com";

const parseButtons = async (url) => {
    const res = await fetch(url);
    const body = await res.text();
    const $ = cheerio.load(body);

    const buttons = [];
    $('div .instant').each((i, el) => {
        const playUrl = $(el).find('button').attr('onclick');
        const button = {
            id: uuid(),
            name: $(el).find('a.instant-link').text(),
            url: `${BASE_URL}${playUrl.substring(playUrl.indexOf('play(\'') + 6, playUrl.indexOf('.mp3') + 4)}`,
            tags: [],
            uploadedBy: 'myinstants.com',
            favoritedBy: [],
            volume: 50,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        buttons.push(button);
    });

    return buttons;
}

const getTrending = async (language = "en", region = 'us', page = 1) => {
    const url = `${BASE_URL}/${language}/index/${region}${page > 1 ? `?page=${page}` : ''}`;
    return await parseButtons(url);
}

const getRecent = async (language = "en", page = 1) => {
    const url = `${BASE_URL}/${language}/recent${page > 1 ? `&page=${page}` : ''}`;
    return await parseButtons(url);
}

const getByCategory = async (language = "en", category, page = 1) => {
    if (!category) throw new Error("Category is required");

    const url = `${BASE_URL}/${language}/categories/${category}${page > 1 ? `&page=${page}` : ''}`;
    return await parseButtons(url);
}

const search = async (language = "en", query, page = 1) => {
    if (!query) throw new Error("Query is required");

    const url = `${BASE_URL}/${language}/search/?name=${query}${page > 1 ? `&page=${page}` : ''}`;
    return await parseButtons(url);
}

const getUploadedByUser = async (language = "en", user) => {
    if (!user) throw new Error("User is required");

    const url = `${BASE_URL}/${language}/profile/${user}/uploaded${page > 1 ? `&page=${page}` : ''}`;
    return await parseButtons(url);
}

const getFavoritedByUser = async (language = "en", user) => {
    if (!user) throw new Error("User is required");

    const url = `${BASE_URL}/${language}/profile/${user}${page > 1 ? `&page=${page}` : ''}`;
    return await parseButtons(url);
}

module.exports = {
    getTrending,
    getRecent,
    getByCategory,
    getUploadedByUser,
    getFavoritedByUser,
    search
}

