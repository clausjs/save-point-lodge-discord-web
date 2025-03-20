class DataSource {
    constructor(store) {
        this.collectionName = '';
        this.db = store;
    }
    async _init() {}
    async get() {}
    async getById(args) {}
    async add(args) {}
    async update(args) {}
    async delete(id) {}
}

module.exports = DataSource;