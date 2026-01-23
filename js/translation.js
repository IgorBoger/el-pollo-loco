function checkOrientation() {
    const warning = document.getElementById('orientationWarning');
    if (!warning) return;
    if (window.innerHeight > window.innerWidth) {
        warning.classList.remove('d-none');
        warning.classList.add('d-flex');
    } else {
        warning.classList.remove('d-flex');
        warning.classList.add('d-none');
    }
}


function applyTranslations() {
    document.documentElement.lang = currentLanguage.toLowerCase();
    // const t = I18N[currentLanguage] || I18N.ES;
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
    setPauseButtonLabel(t);
    updateLanguageUiState();
}


function applyStartScreenTranslations(setText, t) {
    setText('titleGame', t.titleGame);
    setText('orientationCard', t.orientationCard);
    setText('startGame', t.startGame);
}


function applyBurgerMenuTranslations(t) {
    setText('restartGame', t.restartGame);
    setText('aboutGame', t.aboutGame);
    setText('keyHelpButton', t.keyHelpButton);
    setText('rankingList', t.rankingList);
    setText('impressumButton', t.impressumButton);
}


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


function applyKeyHelpTranslations(t) {
    applyKeyHelpHeaders(t);
    applyKeyHelpActions(t);
    applyKeyHelpHint(t);
}


function applyRankingListTranslation(t) {
    setText('rankingTitle', t.rankingTitle);
    setText('rankingHeaderRank', t.rankingHeaderRank);
    setText('rankingHeaderCoins', t.rankingHeaderCoins);
    setText('rankingHeaderTime', t.rankingHeaderTime);
    setText('rankingHeaderResult', t.rankingHeaderResult);
    setText('rankingEmpty', t.rankingEmpty);
    setText('rankingClear', t.rankingClear);
}


function applyKeyHelpHeaders(t) {
    setText('keyHelpTitle', t.keyHelpTitle);
    setText('keyHelpHeaderAction', t.keyHelpHeaderAction);
    setText('keyHelpHeaderKey', t.keyHelpHeaderKey);
}


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


function applyKeyHelpHint(t) {
    const el = document.getElementById('keyHelpHint');
    if (!el) return;
    el.innerHTML = t.keyHelpHint;
}


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


function applySettingsTranslations(t) {
    setText('settingsTitle', t.settingsTitle);
    setText('labelMusic', t.labelMusic);
    setText('labelSound', t.labelSound);
    setText('langToggle', t.langName);
}


function applyLanguageUiTranslations(t) {
    setText('langModalTitle', t.langModalTitle);
    setText('german', t.german);
    setText('spanish', t.spanish);
    setText('english', t.english);
}


function applyGameOverWinOverlayTranslations(t) {
    setText('gameOverRestart', t.gameOverRestart);
    setText('gameOverHome', t.gameOverHome);
    setText('winQuestion', t.winQuestion);
    setText('winNextLevel', t.winNextLevel);
    setText('winHome', t.winHome);
}


function setPauseButtonLabel(t) {
    const btn = document.getElementById('pauseBtn');
    if (!btn) return;
    btn.textContent = isGamePaused ? t.play : t.pause;
}


function updateLanguageUiState() {
    const buttons = getLangOptionButtons();
    buttons.forEach((btn) => setLangButtonState(btn));
}


function getLangOptionButtons() {
    return Array.from(document.querySelectorAll('.lang-opt'));
}


function setLangButtonState(btn) {
    const lang = btn.getAttribute('data-lang');
    const isActive = lang === currentLanguage;
    toggleActiveClass(btn, isActive);
    btn.setAttribute('aria-pressed', String(isActive));
}


function toggleActiveClass(el, isActive) {
    el.classList.toggle('is-active', isActive);
}



function setText(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
}


function setLanguage(lang) {
    currentLanguage = lang;
    // localStorage.setItem('language', currentLanguage);
    setLanguageSetting(currentLanguage);
    applyTranslations();
    loadRemoteLanguage(currentLanguage).then(applyTranslations);
}


let i18nRemote = {};


function initTranslations() {
    applyTranslations();
    loadRemoteLanguage(currentLanguage).then(applyTranslations);
}


function getMergedPack(lang) {
    const localPack = getLocalPack(lang);
    const remotePack = getRemotePack(lang);
    return Object.assign({}, localPack, remotePack);
}


function getLocalPack(lang) {
    return I18N[lang] || I18N.ES || {};
}

function getRemotePack(lang) {
    return i18nRemote[lang] || {};
}


// async function loadRemoteLanguage(lang) {
//     try { await loadLangDocToCache(lang); }
//     catch (e) { console.warn('Remote i18n failed', e); }
// }


async function loadRemoteLanguage(lang) {
    if (isLangCached(lang)) return;
    try { await loadLangDocToCache(lang); }
    catch (e) { console.warn('Remote i18n failed', e); }
}


function isLangCached(lang) {
    return !!i18nRemote[lang];
}


async function loadLangDocToCache(lang) {
    const doc = await fetchLangDoc(lang);
    const data = getDocData(doc);
    saveRemotePack(lang, data);
}


function fetchLangDoc(lang) {
    return db.collection('i18n').doc(lang).get();
}


function getDocData(doc) {
    if (!doc || !doc.exists) return null;
    return doc.data();
}


function saveRemotePack(lang, data) {
    if (!data) return;
    i18nRemote[lang] = data;
}


document.addEventListener('DOMContentLoaded', initTranslations);