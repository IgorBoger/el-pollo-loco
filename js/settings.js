const SETTINGS_KEY = 'settings';


function setSetting(key, value) {
    const settings = loadSettings();
    settings[key] = value;
    saveSettings(settings);
}


function loadSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultSettings();
    return mergeDefaults(parseSettings(raw));
}


function getDefaultSettings() {
    return { language: 'ES', isMusicMuted: false, isSoundMuted: false };
}


function mergeDefaults(data) {
    return Object.assign(getDefaultSettings(), data);
}


function parseSettings(raw) {
    try { return JSON.parse(raw) || {}; }
    catch (e) { return {}; }
}


function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}


function getSetting(key) {
    return loadSettings()[key];
}


function setLanguageSetting(lang) {
    setSetting('language', lang);
}


function setMusicMutedSetting(value) {
    setSetting('isMusicMuted', value);
}


function setSoundMutedSetting(value) {
    setSetting('isSoundMuted', value);
}