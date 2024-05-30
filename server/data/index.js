const firebase = require('firebase');

const { FIREBASE_PRIVATE_KEY: apiKey, FIREBASE_PROJECT_ID: projectId, FIREBASE_SENDER_ID: senderId } = process.env;
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

const Firebase = require('./FirebaseData');
const firebaseData = Firebase(db);

async function authenticate() {
    const { FIREBASE_CLIENT_EMAIL: email, FIREBASE_CLIENT_PASSWORD: pass } = process.env;
    await app.auth().signInWithEmailAndPassword(email, pass);
}

async function shutdown() {
    await firebase.auth().signOut();
    process.exit();
}

module.exports = {
    firebase: firebaseData,
    authenticate,
    shutdown
}