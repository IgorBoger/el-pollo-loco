const SETTINGS_KEY = 'settings';


/**
 * Saves a single setting value under the given key.
 *
 * @param {string} key
 * @param {*} value
 * @returns {void}
 */
function setSetting(key, value) {
    const settings = loadSettings();
    settings[key] = value;
    saveSettings(settings);
}


/**
 * Loads settings from localStorage and merges them with defaults.
 *
 * @returns {Object}
 */
function loadSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultSettings();
    return mergeDefaults(parseSettings(raw));
}


/**
 * Returns the default settings object.
 *
 * @returns {Object}
 */
function getDefaultSettings() {
    return { language: 'EN', isMusicMuted: false, isSoundMuted: false };
}


/**
 * Merges the given settings object with default settings.
 *
 * @param {Object} data
 * @returns {Object}
 */
function mergeDefaults(data) {
    return Object.assign(getDefaultSettings(), data);
}


/**
 * Parses raw settings JSON from localStorage.
 *
 * @param {string} raw
 * @returns {Object}
 */
function parseSettings(raw) {
    try { return JSON.parse(raw) || {}; }
    catch (e) { return {}; }
}


/**
 * Saves the settings object to localStorage.
 *
 * @param {Object} settings
 * @returns {void}
 */
function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}


/**
 * Returns a single setting value for the given key.
 *
 * @param {string} key
 * @returns {*}
 */
function getSetting(key) {
    return loadSettings()[key];
}


/**
 * Persists the selected language setting.
 *
 * @param {string} lang
 * @returns {void}
 */
function setLanguageSetting(lang) {
    setSetting('language', lang);
}


/**
 * Persists the music muted state.
 *
 * @param {boolean} value
 * @returns {void}
 */
function setMusicMutedSetting(value) {
    setSetting('isMusicMuted', value);
}


/**
 * Persists the sound muted state.
 *
 * @param {boolean} value
 * @returns {void}
 */
function setSoundMutedSetting(value) {
    setSetting('isSoundMuted', value);
}


/**
 * Persists the current level index in settings storage.
 * @param {number} value - The current level index.
 * @returns {void}
 */
function setCurrentLevelIndex(value) {
    setSetting('currentLevelIndex', value);
}


/**
 * Returns the persisted current level index from settings storage.
 *
 * @returns {number|undefined} The stored level index or undefined if not set.
 */
function getCurrentLevelIndex() {
    return getSetting('currentLevelIndex');
}