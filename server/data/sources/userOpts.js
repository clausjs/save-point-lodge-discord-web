const DataSource = require("./dataSource");

const logErr = (err) => {
    console.error(err);
}

const buildOptsWithDescriptions = (options, descriptions) => {
    const opts = {};

    const keys = Object.keys(descriptions).map(key => key);
    keys.sort();

    keys.forEach(key => {
        opts[key] = {
            value: options.hasOwnProperty(key) ? options[key] : true,
            description: descriptions[key] || null
        };
    });

    return opts;
}

class UserOpts extends DataSource {
    constructor(store) {
        this.collectionName = "user_options";
        this.descriptionsCollectionName = "descriptions";
        this.db = store;
    }
    get = async (userId) => {
        if (!userId) return logErr(new Error("No userId supplied to getUserOptions"));

        const { db } = this;

        try {
            const optsResponse = await db.collection(this.collectionName).doc(userId).get();
            const descriptionsResponse = await db.collection(this.collectionName).doc(this.descriptionsCollectionName).get();
            const descriptions = descriptionsResponse.data();
    
            const options = optsResponse.data();
            return buildOptsWithDescriptions(options || {}, descriptions);
        } catch (err) {
            logErr(err);
            return {};
        }
    }
    set = async (userId, option) => {
        if (!userId) return logErr(new Error("No userId supplied to setUserOption"));
        if (!option) return logErr(new Error("No option supplied"));

        const { db } = this;

        try {
            let optsResponse = await db.collection(this.collectionName).doc(userId).get();
            const descriptionsResponse = await db.collection(this.collectionName).doc(this.descriptionsCollectionName).get();
            const descriptions = descriptionsResponse.data();
            
            let newOpts = {};
            Object.keys(descriptions).forEach(key => {
                if (Object.keys(option)[0] === key) {
                    newOpts[key] = option[key];
                } else {
                    newOpts[key] = true;
                }
            });

            if (optsResponse.exists) {
                await db.collection(this.collectionName).doc(userId).update(option);
            } else {
                await db.collection(this.collectionName).doc(userId).set(newOpts);
            }

            return buildOptsWithDescriptions(newOpts, descriptions);
        } catch (err) {
            logErr(err);
        }
    }
}

module.exports = UserOpts;