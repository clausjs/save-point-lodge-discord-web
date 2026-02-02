const firebase = require('firebase');


const { FIREBASE_PRIVATE_KEY: apiKey, FIREBASE_PROJECT_ID: projectId, FIREBASE_SENDER_ID: senderId } = process.env;
const devMode = ['dev', 'testing', 'test'].includes(process.env.NODE_ENV);
let firebaseData, app;
if (!devMode) {
    app = firebase.initializeApp({
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
    firebaseData = Firebase(db);
}

async function authenticate() {
    if (devMode) return;
    const { FIREBASE_CLIENT_EMAIL: email, FIREBASE_CLIENT_PASSWORD: pass } = process.env;
    await app.auth().signInWithEmailAndPassword(email, pass);
    firebaseData.isAuthenticated();
}

async function shutdown() {
    if (devMode) return;
    if (firebase.auth.isAuthenticated()) await firebase.auth().signOut();
}

module.exports = {
    firebase: firebaseData,
    authenticate,
    shutdown
}