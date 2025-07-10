const randomBytes = require("node:crypto").randomBytes;

const DataSource = require("./dataSource");

function tokenGenerate(length=56) {
    return Buffer.from(randomBytes(length)).toString('hex');
}

class StreamDeck extends DataSource {
    constructor(store) {
        super(store);
        this.collectionName = 'stream-deck-authorizations';
    }
    get = async (userId) => {
        if (!userId) throw new Error("No userId supplied to getStreamDeckAuth");

        const { db } = this;

        try {
            const response = await db.collection(this.collectionName).doc(userId).get();
            if (!response.exists) {
                const token = tokenGenerate();
                return { token };
            }
            return response.data() || {};
        } catch (err) {
            console.error(err);
            return {};
        }
    }
    set = async (userId, token) => {
        if (!userId) throw new Error("No userId supplied to setStreamDeckAuth");
        if (!token) throw new Error("No token supplied");

        const { db } = this;

        try {
            await db.collection(this.collectionName).doc(userId).set({ token }, { merge: true });
            return { token };
        } catch (err) {
            console.error(err);
            return {};
        }
    }
    getUserByToken = async (token) => {
        if (process.env.NODE_ENV === 'dev' && token === 'abc123') return { userId: process.env.OWNER_ID, token: 'abc123' };
        if (!token) throw new Error("No token supplied to getUserByStreamDeckToken");

        const { db } = this;

        try {
            const snapshot = await db.collection(this.collectionName).where('token', '==', token).get();
            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return { userId: doc.id, ...doc.data() };
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}

module.exports = StreamDeck;