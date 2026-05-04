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
        this.clips = [];
    }
    async _init() {
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
        // this.clips = soundboardItems;

        db.collection(this.collectionName).onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                const clipData = change.doc.data();
                const clip = { id: change.doc.id, ...clipData };
                clip.createdAt = clipData.createdAt ? clipData.createdAt.toDate() : new Date();
                clip.updatedAt = clipData.updatedAt ? clipData.updatedAt.toDate() : new Date();
                if (!clip.volume) clip.volume = 50;
                
                if (change.type === "added") {
                    this.clips.push(clip);
                } else if (change.type === "modified") {
                    this.clips = this.clips.map(c => c.id === clip.id ? clip : c);
                } else if (change.type === "removed") {
                    this.clips = this.clips.filter(c => c.id !== clip.id);
                }
            });
        });
    }
    get () {
        return this.clips;
    }
    getRandom () {
        const randomIndex = Math.floor(Math.random() * this.clips.length);
        return this.clips[randomIndex];
    }
    async getById (id) {
        const { db } = this;
        
        try {
            const response = await db.collection(this.collectionName).doc(id).get();
            if (response.exists) {
                const clip = { id: response.id, ...response.data() };
                clip.createdAt = clip.createdAt ? clip.createdAt.toDate() : new Date();
                clip.updatedAt = clip.updatedAt ? clip.updatedAt.toDate() : new Date();
                if (!clip.volume) clip.volume = 50;
                if (!clip.category) clip.category = "Uncategorized";
                return clip;
            }
        } catch (err) {
            logErr(err);
            throw err;
        }
    }
    async add (opts) {
        const { db } = this;
        const { url, name, description = "", tags = [], uploadedBy = "", volume = 50, category = "Uncategorized" } = opts;
        const transactionDate = Timestamp.fromDate(new Date());
        
        const clip = {
            id: `URL-${uuid()}`,
            url,
            name,
            description,
            tags: tags.map(tag => tag.toLowerCase()),
            uploadedBy,
            favoritedBy: [],
            volume,
            category,
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
    async update (clip) {
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
            await db.collection(this.collectionName).doc(clip.id).set({ ...clip, tags: clip.tags.map(t => t.toLowerCase()), createdAt: createTimestamp, updatedAt: Timestamp.fromDate(new Date()) });
            return clip;
        } catch (err) {
            logErr(err);
            throw err;
        }
    }
    async delete (id) {
        const { db } = this;

        try {
            await db.collection(this.collectionName).doc(id).delete();
            return true;
        } catch (err) {
            logErr(err);
            return false;
        }
    }
    async toggleFavorite (id, user) {
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