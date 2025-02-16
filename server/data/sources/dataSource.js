class DataSource {
    constructor(store) {
        this.collectionName = '';
        this.db = store;
    }
    get() {}
    get(id) {}
    add(opts) {}
    set(opts) {}
    delete(opts) {}
}

module.exports = DataSource;