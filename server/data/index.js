const firebase = require('firebase');
const keys = require('../../keys.json');

const { FIREBASE_API_KEY: apiKey, FIREBASE_PROJECT_ID: projectId, FIREBASE_SENDER_ID: senderId } = process.env;
const app = firebase.initializeApp({
    apiKey: apiKey || keys.db.key,
    authDomain: `${projectId || keys.db.projectId}.firebaseapp.com`,
    databaseURL: `${projectId || keys.db.projectId}.firebaseio.com`,
    projectId: projectId || keys.db.projectId,
    storageBucket: `${projectId || keys.db.projectId}.appspot.com`,
    messagingSenderId: senderId || keys.db.senderId
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
    const { FIREBASE_EMAIL: email, FIREBASE_PASSWORD: pass } = process.env;
    await app.auth().signInWithEmailAndPassword(email || keys.db.email, pass || keys.db.password);
}

async function shutdown() {
    await firebase.auth().signOut();
    process.exit();
}

module.exports = {
    initializeUserData,
    authenticate,
    shutdown
}