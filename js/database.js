let db = null;


/**
 * Initializes Firebase and creates the Firestore database instance.
 *
 * @returns {void}
 */
function initFirebase() {
    firebase.initializeApp(getFirebaseConfig());
    db = firebase.firestore();
}


/**
 * Returns the Firebase configuration object.
 *
 * @returns {Object} Firebase configuration.
 */
function getFirebaseConfig() {
    return {
        apiKey: "AIzaSyAWTNysvY7xX0w9NwL1Z7fV0hR3c13U",
        authDomain: "el-pollo-loco-2e874.firebaseapp.com",
        projectId: "el-pollo-loco-2e874",
        appId: "1:1087588973215:web:956dde725b0fd6ad16c0aa"
    };
}


initFirebase();


/**
 * Runs a simple Firestore read test to verify connectivity.
 *
 * @returns {void}
 */
function testFirestore() {
    db.collection('i18n').get()
        .then(() => console.log('Firestore OK'))
        .catch(e => console.error('Firestore ERROR', e));
}


/**
 * Executes the Firestore test if it is enabled.
 *
 * @returns {void}
 */
function runFirestoreTest() {
    if (!isFirestoreTestEnabled()) return;
    testFirestore();
}


/**
 * Determines whether the Firestore test should run.
 *
 * @returns {boolean} True if the Firestore test is enabled.
 */
function isFirestoreTestEnabled() {
    return false;
}


runFirestoreTest();


/**
 * Returns a Firestore document reference for the i18n language document.
 *
 * @param {string} lang - Language code (e.g. "DE", "EN", "ES").
 * @returns {firebase.firestore.DocumentReference} The Firestore document reference.
 */
function getLangDoc(lang) {
    return db.collection('i18n').doc(lang);
}


/**
 * Fetches the i18n document data for a given language.
 *
 * @param {string} lang - Language code (e.g. "DE", "EN", "ES").
 * @returns {Promise<Object>} The document data or an empty object if missing.
 */
async function fetchI18nDoc(lang) {
    const snap = await getLangDoc(lang).get();
    return snap.exists ? (snap.data() || {}) : {};
}


/**
 * Fetches i18n data for a language and stores it in the provided cache object.
 *
 * @param {string} lang - Language code (e.g. "DE", "EN", "ES").
 * @param {Object} cache - Cache object to write the loaded language data into.
 * @returns {Promise<Object>} The loaded language data.
 */
async function fetchI18nToCache(lang, cache) {
    const data = await fetchI18nDoc(lang);
    cache[lang] = data;
    return data;
}