const DataSource = require("./dataSource");

const logErr = (err) => {
    console.error(err);
}

class Commands extends DataSource {
    constructor(store) {
        super(store);
        this.collectionName = "commands";
    }
    get = async () => {
        const { db } = this;
        const collection = db.collection(this.collectionName);
        const getCommandsResponse = await collection.get();

        const commands = [];
        getCommandsResponse.forEach(res => {
            const command = res.data();

            if (res.id.indexOf('_input') === -1) {
                commands.push(command);
            }
        });
        return commands;
    }
}

module.exports = Commands;