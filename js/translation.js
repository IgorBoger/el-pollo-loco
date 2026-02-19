/**
 * Applies translations to all UI sections based on the current language.
 * @returns {void}
 */
function applyTranslations() {
    document.documentElement.lang = currentLanguage.toLowerCase();
    const t = getMergedPack(currentLanguage);
    applyStartScreenTranslations(setText, t);
    applyBurgerMenuTranslations(t);
    applyStoryTranslations(t);
    applyKeyHelpTranslations(t);
    applyRankingListTranslation(t);
    applyImpressumTranslations(t);
    applySettingsTranslations(t);
    applyLanguageUiTranslations(t);
    applyGameOverWinOverlayTranslations(t);
    updateLanguageUiState();
    applyLevelIndicatorTranslations(t);
}


/**
 * Applies translations for the level indicator label.
 * @param {Object} t
 * @returns {void}
 */
function applyLevelIndicatorTranslations(t) {
    setText('levelIndicatorLabel', t.levelIndicatorLabel);
}


/**
 * Applies translations for the start screen.
 * @param {Function} setText
 * @param {Object} t
 * @returns {void}
 */
function applyStartScreenTranslations(setText, t) {
    setText('titleGame', t.titleGame);
    setText('orientationCard', t.orientationCard);
    setText('startGame', t.startGame);
}


/**
 * Applies translations for the burger menu.
 * @param {Object} t
 * @returns {void}
 */
function applyBurgerMenuTranslations(t) {
    setText('restartGame', t.restartGame);
    setText('aboutGame', t.aboutGame);
    setText('keyHelp', t.keyHelp);
    setText('rankingList', t.rankingList);
    setText('impressum', t.impressum);
    setText('copyright', t.copyright);
}


/**
 * Applies translations for the story overlay.
 * @param {Object} t
 * @returns {void}
 */
function applyStoryTranslations(t) {
    setText('storyTitle', t.storyTitle);
    setText('storyP1', t.storyP1);
    setText('storyLabelGoal', t.storyLabelGoal);
    setText('storyTextGoal', t.storyTextGoal);
    setText('storyLabelControls', t.storyLabelControls);
    setText('storyTextControls', t.storyTextControls);
    setText('storyLabelTip', t.storyLabelTip);
    setText('storyTextTip', t.storyTextTip);
}


/**
 * Applies translations for the key help overlay.
 * @param {Object} t
 * @returns {void}
 */
function applyKeyHelpTranslations(t) {
    applyKeyHelpHeaders(t);
    applyKeyHelpActions(t);
    applyKeyHelpHint(t);
}


/**
 * Applies translations for the ranking list.
 * @param {Object} t
 * @returns {void}
 */
function applyRankingListTranslation(t) {
    setText('rankingTitle', t.rankingTitle);
    setText('rankingHeaderRank', t.rankingHeaderRank);
    setText('rankingHeaderCoins', t.rankingHeaderCoins);
    setText('rankingHeaderTime', t.rankingHeaderTime);
    setText('rankingHeaderResult', t.rankingHeaderResult);
    setText('rankingEmpty', t.rankingEmpty);
    setText('rankingClear', t.rankingClear);
}


/**
 * Applies translated headers for the key help overlay.
 * @param {Object} t
 * @returns {void}
 */
function applyKeyHelpHeaders(t) {
    setText('keyHelpTitle', t.keyHelpTitle);
    setText('keyHelpHeaderAction', t.keyHelpHeaderAction);
    setText('keyHelpHeaderKey', t.keyHelpHeaderKey);
}


/**
 * Applies translated action labels for the key help overlay.
 * @param {Object} t
 * @returns {void}
 */
function applyKeyHelpActions(t) {
    setText('keyActionMoveLeft', t.keyActionMoveLeft);
    setText('keyKeyMoveLeft', t.keyKeyMoveLeft);
    setText('keyActionMoveRight', t.keyActionMoveRight);
    setText('keyKeyMoveRight', t.keyKeyMoveRight);
    setText('keyActionJump', t.keyActionJump);
    setText('keyKeyJump', t.keyKeyJump);
    setText('keyActionThrow', t.keyActionThrow);
    setText('keyKeyThrow', t.keyKeyThrow);
}


/**
 * Applies the translated hint text for the key help overlay.
 * @param {Object} t
 * @returns {void}
 */
function applyKeyHelpHint(t) {
    const el = document.getElementById('keyHelpHint');
    if (!el) return;
    el.innerHTML = t.keyHelpHint;
}


/**
 * Applies translations for the impressum overlay.
 * @param {Object} t
 * @returns {void}
 */
function applyImpressumTranslations(t) {
    const ids = [
        'impressumTitle', 'impressumResponsibleTitle', 'impressumName', 'impressumStreet',
        'impressumCity', 'impressumEmailLabel', 'impressumEmailValue', 'impressumHintTitle',
        'impressumHintText', 'impressumSupervisionTitle', 'impressumSupervisionText',
        'impressumSupervisionPlaceholder', 'impressumLiabilityTitle', 'impressumLiabilityText',
        'impressumCopyrightTitle', 'impressumCopyrightText', 'impressumStatusTitle', 'impressumStatusText'
    ];
    ids.forEach((id) => setText(id, t[id]));
}


/**
 * Applies translations for the settings overlay.
 * @param {Object} t
 * @returns {void}
 */
function applySettingsTranslations(t) {
    setText('settingsTitle', t.settingsTitle);
    setText('labelMusic', t.labelMusic);
    setText('labelSound', t.labelSound);
    setText('langToggle', t.langName);
}


/**
 * Applies translations for the language UI elements.
 *
 * @param {Object} t
 * @returns {void}
 */
function applyLanguageUiTranslations(t) {
    setText('langModalTitle', t.langModalTitle);
    setText('german', t.german);
    setText('spanish', t.spanish);
    setText('english', t.english);
}


/**
 * Applies translations for the game over and win overlays.
 * @param {Object} t
 * @returns {void}
 */
function applyGameOverWinOverlayTranslations(t) {
    setText('gameOverRestart', t.gameOverRestart);
    setText('gameOverHome', t.gameOverHome);
    setText('winQuestion', t.winQuestion);
    setText('winNextLevel', t.winNextLevel);
    setText('winHome', t.winHome);
}


/**
 * Updates the language option button states.
 * @returns {void}
 */
function updateLanguageUiState() {
    const buttons = getLangOptionButtons();
    buttons.forEach((btn) => setLangButtonState(btn));
}


/**
 * Returns all language option buttons.
 * @returns {HTMLElement[]}
 */
function getLangOptionButtons() {
    return Array.from(document.querySelectorAll('.lang-opt'));
}


/**
 * Updates the active state of a single language option button.
 * @param {HTMLElement} btn
 * @returns {void}
 */
function setLangButtonState(btn) {
    const lang = btn.getAttribute('data-lang');
    const isActive = lang === currentLanguage;
    toggleActiveClass(btn, isActive);
    btn.setAttribute('aria-pressed', String(isActive));
}


/**
 * Toggles the "is-active" class on an element.
 * @param {HTMLElement} el
 * @param {boolean} isActive
 * @returns {void}
 */
function toggleActiveClass(el, isActive) {
    el.classList.toggle('is-active', isActive);
}


/**
 * Sets the textContent of an element by id.
 * @param {string} id
 * @param {string} text
 * @returns {void}
 */
function setText(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
}


/**
 * Sets the current language and persists it, then applies translations.
 * @param {string} lang
 * @returns {void}
 */
function setLanguage(lang) {
    currentLanguage = lang;
    setLanguageSetting(currentLanguage);
    applyTranslations();
    loadRemoteLanguage(currentLanguage).then(applyTranslations);
}


let i18nRemote = {};


/**
 * Initializes translations by applying local texts and then loading remote i18n.
 * @returns {void}
 */
function initTranslations() {
    applyTranslations();
    loadRemoteLanguage(currentLanguage).then(applyTranslations);
}


/**
 * Returns a merged translation pack for a language, combining local and remote packs.
 * @param {string} lang
 * @returns {Object}
 */
function getMergedPack(lang) {
    const localPack = getLocalPack(lang);
    const remotePack = getRemotePack(lang);
    return Object.assign({}, localPack, remotePack);
}


/**
 * Returns the local translation pack for a language.
 * @param {string} lang
 * @returns {Object}
 */
function getLocalPack(lang) {
    return I18N[lang] || I18N.ES || {};
}


/**
 * Returns the remote translation pack for a language.
 * @param {string} lang
 * @returns {Object}
 */
function getRemotePack(lang) {
    return i18nRemote[lang] || {};
}


/**
 * Loads remote translation data for a language into cache if possible.
 * @param {string} lang
 * @returns {Promise<void>}
 */
async function loadRemoteLanguage(lang) {
    if (!canLoadRemoteI18n()) return;
    if (isLangCached(lang)) return;
    try { await loadLangDocToCache(lang); }
    catch (e) { console.warn('Remote i18n failed', e); }
}


/**
 * Checks whether remote i18n loading is available.
 * @returns {boolean}
 */
function canLoadRemoteI18n() {
    return typeof db !== 'undefined' && !!db;
}


/**
 * Checks whether a language is already cached.
 * @param {string} lang
 * @returns {boolean}
 */
function isLangCached(lang) {
    return !!i18nRemote[lang];
}


/**
 * Loads a language document into the remote cache via Firestore.
 * @param {string} lang
 * @returns {Promise<void>}
 */
async function loadLangDocToCache(lang) {
    if (typeof fetchI18nToCache !== 'function') return;
    await fetchI18nToCache(lang, i18nRemote);
}