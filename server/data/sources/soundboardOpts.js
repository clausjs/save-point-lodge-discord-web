const DataSource = require("./dataSource");

const logErr = (err) => {
    console.error(err);
}

class SoundboardOpts extends DataSource {
    constructor(store) {
        super(store);
        this.collectionName = "soundboard-user-opts";
        this.defaultsCollection = "soundboard-opts-defaults";
        this.OPTS = {};
    }
    _init = async () => {
        const { db } = this;
        try {
            const defaultOptsRes = await db.collection(this.defaultsCollection).get();
            defaultOptsRes.forEach(doc => {
                this.OPTS[doc.id] = doc.data();
            });
        } catch (err) {
            logErr(err);
        }
    }
    get = async (userId) => {
        if (!userId) return logErr(new Error("No userId supplied to get soundboard options"));

        const { db } = this;

        let opts = {};
        try {
            const optsRes = await db.collection(this.collectionName).doc(userId).get();
            if (optsRes.exists) {
                opts = optsRes.data();
            }
            
            Object.keys(this.OPTS).forEach(optKey => {
                if (!opts.hasOwnProperty(optKey)) {
                    opts[optKey] = {
                        description: this.OPTS[optKey].description,
                        enabled: this.OPTS[optKey].default
                    };
                } else {
                    opts[optKey].description = this.OPTS[optKey].description;
                    opts[optKey].enabled = opts[optKey].enabled !== undefined ? opts[optKey].enabled : this.OPTS[optKey].default;
                }

                if (this.OPTS[optKey].admin && opts.hasOwnProperty(optKey)) {
                    delete opts[optKey];
                }
            });

            return opts;
        } catch (err) {
            logErr(err);
            return {};
        }
    }
    getById = async ({userId, opt}) => {
        if (!userId) return logErr(new Error("No userId supplied to get soundboard options"));
        if (!opt) return logErr(new Error("No option supplied"));

        const { db } = this;

        try {
            const optsRes = await db.collection(this.collectionName).doc(userId).get();
            if (optsRes.exists) {
                return optsRes.data()[opt] ?? false;
            }
        } catch (err) {
            logErr(err);
            return {};
        }
    }
    set = async (userId, opts) => {
        if (!userId) return logErr(new Error("No userId supplied to set soundboard option"));
        if (!opts) return logErr(new Error("No options supplied"));

        const { db } = this;

        let newOpts = {};
        const optsRes = await db.collection(this.collectionName).doc(userId).get();
        if (optsRes.exists) {
            newOpts = optsRes.data();
        }

        Object.keys(this.OPTS).forEach(optKey => {
            if (!newOpts.hasOwnProperty(optKey)) {
                newOpts[optKey] = {
                    description: this.OPTS[optKey].description,
                    enabled: this.OPTS[optKey].default
                };
            } else if (opts.hasOwnProperty(optKey)) newOpts[optKey] = opts[optKey];
        });

        try {
            await db.collection(this.collectionName).doc(userId).set(newOpts);
            return opts;
        } catch (err) {
            logErr(err);
        }
    }
}

module.exports = SoundboardOpts;