const UserOpts = require('./sources/userOpts');
const Soundboard = require('./sources/soundboard');
const SoundboardOpts = require('./sources/soundboardOpts');
const Commands = require('./sources/commands');

class FirebaseData {
    constructor(store) {
        this.db = store;
        this.userOpts = new UserOpts(store);
        this.soundboard = new Soundboard(store);
        this.soundboardOpts = new SoundboardOpts(store);
        this.commands = new Commands(store);
    }
    isAuthenticated = async () => {
        await this.userOpts._init();
        await this.soundboard._init();
        await this.soundboardOpts._init();
        await this.commands._init();
    }
}

module.exports = (store) => {
    const instance = new FirebaseData(store);
    return instance;
}