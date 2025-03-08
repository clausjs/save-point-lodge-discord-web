const uuid = require("uuid").v4;
const Timestamp = require('firebase').firestore.Timestamp;
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
            const clip = { id: res.id, ...clipData };
            clip.createdAt = clipData.createdAt ? clipData.createdAt.toDate() : new Date();
            clip.updatedAt = clipData.updatedAt ? clipData.updatedAt.toDate() : new Date();
            soundboardItems.push(clip);
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
        const { url, name, description = "", tags = [], uploadedBy = "" } = opts;
        const transactionDate = Timestamp.fromDate(new Date());
        
        const clip = {
            id: `URL-${uuid()}`,
            url,
            name,
            description,
            tags,
            uploadedBy,
            favoritedBy: [],
            createdAt: transactionDate,
            updatedAt: transactionDate
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
            await db.collection(this.collectionName).doc(clip.id).set({ ...clip, createdAt: Timestamp.fromDate(new Date(clip.createdAt)), updatedAt: Timestamp.fromDate(new Date()) });
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