const UserOpts = require('./sources/userOpts');
const Soundboard = require('./sources/soundboard');
const Commands = require('./sources/commands');

class FirebaseData {
    constructor(store) {
        this.db = store;
        this.userOpts = new UserOpts(store);
        this.soundboard = new Soundboard(store);
        this.commands = new Commands(store);
    }
}

module.exports = (store) => {
    const instance = new FirebaseData(store);
    return instance;
}