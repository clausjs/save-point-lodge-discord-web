class DataSource {
    constructor(store) {
        this.collectionName = '';
        this.db = store;
    }
    get() {}
    getById(id) {}
    add(args) {}
    update(args) {}
    delete(id) {}
}

module.exports = DataSource;