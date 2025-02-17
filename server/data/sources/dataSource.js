class DataSource {
    constructor(store) {
        this.collectionName = '';
        this.db = store;
    }
    get() {}
    getById(id) {}
    add(opts) {}
    set(opts) {}
    delete(opts) {}
}

module.exports = DataSource;