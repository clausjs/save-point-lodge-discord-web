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
            if (!clip.volume) clip.volume = 50;
            soundboardItems.push(clip);
        });
        return soundboardItems;
    }
    getById = async (id) => {
        const { db } = this;
        
        try {
            const response = await db.collection(this.collectionName).doc(id).get();
            if (response.exists) {
                const clip = { id: response.id, ...response.data() };
                clip.createdAt = clip.createdAt ? clip.createdAt.toDate() : new Date();
                clip.updatedAt = clip.updatedAt ? clip.updatedAt.toDate() : new Date();
                if (!clip.volume) clip.volume = 50;
                return clip;
            }
        } catch (err) {
            logErr(err);
            throw err;
        }
    }
    add = async (opts) => {
        const { db } = this;
        const { url, name, description = "", tags = [], uploadedBy = "", volume = 50 } = opts;
        const transactionDate = Timestamp.fromDate(new Date());
        
        const clip = {
            id: `URL-${uuid()}`,
            url,
            name,
            description,
            tags,
            uploadedBy,
            favoritedBy: [],
            volume,
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


        // Safety check to ensure clip has an creation date. If non-existent
        // copy the updated date or use today
        let createTimestamp = clip.createdAt;
        if (createTimestamp) {
            createTimestamp = Timestamp.fromDate(new Date(createTimestamp));
        } else {
            if (clip.updatedAt) {
                createTimestamp = Timestamp.fromDate(new Date(clip.updatedAt));
            } else {
                createTimestamp = Timestamp.fromDate(new Date());
            }
        }

        try {
            await db.collection(this.collectionName).doc(clip.id).set({ ...clip, createdAt: createTimestamp, updatedAt: Timestamp.fromDate(new Date()) });
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
    toggleFavorite = async (id, user) => {
        const { db } = this;
        
        try {
            const clip = await this.getById(id);
            
            if (!clip) throw new Error("Clip not found");
            if (!clip.favoritedBy) clip.favoritedBy = [];

            if (clip.favoritedBy.includes(user)) {
                clip.favoritedBy = clip.favoritedBy.filter(u => u !== user);
            } else {
                clip.favoritedBy.push(user);
            }

            await this.update(clip);
            return clip;
        } catch (err) {
            logErr(err);
            throw err;
        }
    }
}

module.exports = Soundboard;