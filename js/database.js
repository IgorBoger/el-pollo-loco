let db = null;

function initFirebase() {
    firebase.initializeApp(getFirebaseConfig());
    db = firebase.firestore();
}


function getFirebaseConfig() {
    return {
        apiKey: "AIzaSyAWTNysvY7xX0w9NwL1Z7fV0hR3c13U",
        authDomain: "el-pollo-loco-2e874.firebaseapp.com",
        projectId: "el-pollo-loco-2e874",
        appId: "1:1087588973215:web:956dde725b0fd6ad16c0aa"
    };
}


initFirebase();


function testFirestore() {
    db.collection('i18n').get()
        .then(() => console.log('Firestore OK'))
        .catch(e => console.error('Firestore ERROR', e));
}


function runFirestoreTest() {
    if (!isFirestoreTestEnabled()) return;
    testFirestore();
}


function isFirestoreTestEnabled() {
    // return true;
    return false;
}


runFirestoreTest();


function getLangDoc(lang) {
    return db.collection('i18n').doc(lang);
}


async function fetchI18nDoc(lang) {
    // console.log('API fetchI18nDoc:', lang);
    const snap = await getLangDoc(lang).get();
    return snap.exists ? (snap.data() || {}) : {};
}


async function fetchI18nToCache(lang, cache) {
    const data = await fetchI18nDoc(lang);
    cache[lang] = data;
    return data;
}