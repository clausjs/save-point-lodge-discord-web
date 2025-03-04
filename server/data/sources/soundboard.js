const uuid = require("uuid").v4;

const DataSource = require("./dataSource");

const logErr = (err) => {
    console.error(err);
}

class Soundboard extends DataSource {
    constructor(store) {
        super(store);
        this.collectionName = "soundboard-clips";
    }
    get = async () => {
        const { db } = this;
        const getSoundboardItemsResponse = await db.collection(this.collectionName).get();

        const soundboardItems = [];
        getSoundboardItemsResponse.forEach(res => {
            const clipData = res.data();
            soundboardItems.push({ id: res.id, ...clipData });
        });

        return soundboardItems;
    }
    getById = async (id) => {
        const { db } = this;
        
        try {
            const response = await db.collection(this.collectionName).doc(id).get();
            if (response.exists) return response.data();
        } catch (err) {
            logErr(err);
            throw err;
        }
    }
    add = async (opts) => {
        const { db } = this;
        const { url, name, description, tags, uploadedBy } = opts;
        
        const clip = {
            id: `URL-${uuid()}`,
            url,
            name,
            description,
            tags,
            uploadedBy,
            favoritedBy: []
        };
        
        try {
            await db.collection(this.collectionName).doc(clip.id).set(clip);
            return clip;
        } catch (err) {
            logErr(err);
            throw err;
        }
    }
    update = async (clip) => {
        const { db } = this;

        try {
            await db.collection(this.collectionName).doc(clip.id).set(clip);
            return clip;
        } catch (err) {
            logErr(err);
            throw err;
        }
    }
    delete = async (id) => {
        const { db } = this;

        try {
            await db.collection(this.collectionName).doc(id).delete();
            return true;
        } catch (err) {
            logErr(err);
            return false;
        }
    }
}

module.exports = Soundboard;