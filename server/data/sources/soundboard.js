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
        const collection = db.collection(this.collectionName);
        const getSoundboardItemsResponse = await collection.get();

        const soundboardItems = [];
        getSoundboardItemsResponse.forEach(res => {
            soundboardItems.push(res.data());
        });

        return soundboardItems;
    }
    get = async (id) => {
        const { db } = this;
        const collection = db.collection(this.collectionName);
        console.log("getting soundboard item with id: ", id);
        const doc = collection.doc(id);

        try {
            const response = await doc.get();
            console.log("response: ", response.data());
            return response.data();
        } catch (err) {
            logErr(err);
            return {};
        }
    }
    add = async (id, name, description, tags, urlOrFileName) => {
        const { db } = this;
        const collection = db.collection(this.collectionName);
        const doc = collection.doc(id);

        try {
            if (id.indexOf('URL')) {
                await doc.set({
                    name,
                    description,
                    tags,
                    url: urlOrFileName
                });
            } else {
                await doc.set({
                    name,
                    description,
                    tags,
                    fileName: urlOrFileName
                });
            }
        } catch (err) {
            logErr(err);
        }
    }
    set = async (clip) => {
        const { db } = this;
        const collection = db.collection(this.collectionName);
        const doc = collection.doc(id);

        try {
            await doc.set(clip);
        } catch (err) {
            logErr(err);
        }
    }
    delete = async (id) => {
        const { db } = this;
        const collection = db.collection(this.collectionName);
        const doc = collection.doc(id);

        try {
            await doc.delete();
        } catch (err) {
            logErr(err);
        }
    }
}

module.exports = Soundboard;