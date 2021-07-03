const firebase = require('firebase');

const { DB_KEY: apiKey, DB_PROJECTID: projectId, DB_SENDERID: senderId } = process.env;
const app = firebase.initializeApp({
    apiKey: apiKey,
    authDomain: `${projectId}.firebaseapp.com`,
    databaseURL: `${projectId}.firebaseio.com`,
    projectId: projectId,
    storageBucket: `${projectId}.appspot.com`,
    messagingSenderId: senderId
});
let db = app.firestore();
db.settings({ timestampsInSnapshots: true });

const ServerData = require('./ServerData');
const UserData = require('./UserData');
const serverdata = ServerData(db);
let userdata = null;
const initializeUserData = (userId) => {
    userdata = UserData({
        store: db,
        userId,
        serverdata
    });
    return userdata;
};

async function authenticate() {
    const { DB_EMAIL: email, DB_PASSWORD: pass } = process.env;
    await app.auth().signInWithEmailAndPassword(email, pass);
}

async function shutdown() {
    await firebase.auth().signOut();
    process.exit();
}

module.exports = {
    initializeUserData,
    serverdata,
    authenticate,
    shutdown
}