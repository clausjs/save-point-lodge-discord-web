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
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        buttons.push(button);
    });

    return buttons;
}

const getTrending = async (language = "en", region = 'us') => {
    const url = `${BASE_URL}/${language}/index/${region}/`;
    return await parseButtons(url);
}

const getRecent = async (language = "en") => {
    const url = `${BASE_URL}/${language}/recent`;
    return await parseButtons(url);
}

const getByCategory = async (language = "en", category) => {
    if (!category) throw new Error("Category is required");

    const url = `${BASE_URL}/${language}/categories/${category}/`;
    return await parseButtons(url);
}

const search = async (language = "en", query) => {
    if (!query) throw new Error("Query is required");

    const url = `${BASE_URL}/${language}/search/?name=${query}`;
    return await parseButtons(url);
}

const getUploadedByUser = async (language = "en", user) => {
    if (!user) throw new Error("User is required");

    const url = `${BASE_URL}/${language}/profile/${user}/uploaded/`;
    return await parseButtons(url);
}

const getFavoritedByUser = async (language = "en", user) => {
    if (!user) throw new Error("User is required");

    const url = `${BASE_URL}/${language}/profile/${user}/`;
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

