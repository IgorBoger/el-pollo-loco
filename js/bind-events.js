bootstrapUi();

function onWindowLoad() {
    initUiOnLoad();
    bindBaseGameUiEvents();
    bindBurgerUiEvents();
    bindAudioToggleEvents();
    bindSettingsOverlayEvents();
    bindOverlayOpenCloseEvents();
    bindOverlayOutsideCloseEvents();
    bindOverlayContentDelegation();
    bindEndscreenButtons();
    bindGlobalOutsideClose();
    bindViewportEvents();
    addReleaseGuards();
}


function initUiOnLoad() {
    initTranslations();
    handleViewportChange();
    addMobileButtonsFunction();
    setAudioIcons();
}


function setAudioIcons() {
    setIconSrc('musicIcon', isMusicMuted ? 'img/mute.png' : 'img/speaker.png');
    setIconSrc('soundIcon', isSoundMuted ? 'img/mute.png' : 'img/speaker.png');
}


function setIconSrc(id, src) {
    const el = document.getElementById(id);
    if (el) el.src = src;
}


function bindBaseGameUiEvents() {
    bindClick('restartGameBtn', restartGame);
    bindClick('pauseBtn', togglePause);
}


function bindClick(id, fn) {
    document.getElementById(id)?.addEventListener('click', fn);
}


function bindBurgerUiEvents() {
    bindClick('burgerBtn', toggleBurgerMenu);
    bindClick('burgerClose', closeBurgerMenu);
}


function bindAudioToggleEvents() {
    bindClick('musicToggle', toggleMusic);
    bindClick('soundToggle', toggleSound);
}


function bindSettingsOverlayEvents() {
    bindClick('openSettings', openSettingsOverlay);
    bindClick('closeSettings', closeSettingsOverlay);
}


function bindOverlayOpenCloseEvents() {
    bindStoryOverlayEvents();
    bindKeyHelpOverlayEvents();
    bindImpressumOverlayEvents();
    bindRankingOverlayEvents();
    bindRankingClearOverlayEvents();
    bindLangModalOverlayEvents();
}


function bindOverlayOutsideCloseEvents() {
    bindOutsideClose('storyOverlay', '#storyOverlay .story-card', closeStoryOverlay);
    bindOutsideClose('keyHelpOverlay', '#keyHelpOverlay .key-help-card', closeKeyHelpOverlay);
    bindOutsideClose('langOverlay', '#langOverlay .modal-card', closeLangModal);
    bindOutsideClose('impressumOverlay', '#impressumOverlay .impressum-card', closeImpressumOverlay);
    bindOutsideClose('rankingOverlay', '#rankingOverlay .ranking-card', closeRankingOverlay);
}


function bindOverlayContentDelegation() {
    const container = document.querySelector('#langOverlay .modal-content');
    if (!container) return;
    container.addEventListener('click', (e) => {
        onLangOptionClick(e);
        e.stopPropagation();
    });
}


function bindEndscreenButtons() {
    bindGameOverButtons();
    bindWinButtons();
}


function bindGameOverButtons() {
    bindClick('restartBtn', onGameOverRestartClick);
    bindClick('homeBtn', onGameOverHomeClick);
}


function onGameOverRestartClick() {
    closeEndOverlayThen('gameOverOverlay', quickRestartGame);
}


function onGameOverHomeClick() {
    closeEndOverlayThen('gameOverOverlay', restartGame);
}


function bindWinButtons() {
    bindClick('nextLevelBtn', onNextLevelClick);
    bindClick('winHomeBtn', onWinHomeClick);
}


function onNextLevelClick() {
    closeEndOverlayThen('winOverlay', quickRestartGame);
}


function onWinHomeClick() {
    closeEndOverlayThen('winOverlay', restartGame);
}


function bindGlobalOutsideClose() {
    document.addEventListener('click', outsideCloseHandler);
}


function bindLangModalOverlayEvents() {
    bindClick('langToggle', openLangModal);
    bindClick('langClose', closeLangModal);
}


function bindStoryOverlayEvents() {
    bindClick('aboutGameBtn', openStoryOverlay);
    bindClick('closeStory', closeStoryOverlay);
}


function bindKeyHelpOverlayEvents() {
    bindClick('keyHelpBtn', openKeyHelpOverlay);
    bindClick('keyHelpClose', closeKeyHelpOverlay);
}


function bindImpressumOverlayEvents() {
    bindClick('impressumBtn', openImpressumOverlay);
    bindClick('impressumClose', closeImpressumOverlay);
}



function bindRankingOverlayEvents() {
    bindClick('rankingListBtn', openRankingOverlay);
    bindClick('rankingClose', closeRankingOverlay);
}


function bindRankingClearOverlayEvents() {
    bindClick('rankingClear', onClearRankingClick);
    bindClick('rankingClearOk', onRankingClearConfirm);
    bindClick('rankingClearCancel', onRankingClearCancel);
    bindEvent('rankingClearOverlay', 'click', onRankingClearOverlayClick);
}


function bindEvent(id, type, fn) {
    document.getElementById(id)?.addEventListener(type, fn);
}


function bindViewportEvents() {
    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('orientationchange', handleViewportChange);
    document.addEventListener('fullscreenchange', handleViewportChange);
}


function outsideCloseHandler(e) {
    if (shouldIgnoreOutsideClose()) return;
    if (shouldCloseSettingsByOutsideClick(e)) {
        closeSettingsOverlay();
        return;
    }
    if (shouldCloseBurgerByOutsideClick(e)) closeBurgerMenu();
}


function shouldIgnoreOutsideClose() {
    return isOverlayOpen('langOverlay')
        || isOverlayOpen('keyHelpOverlay')
        || isOverlayOpen('storyOverlay')
        || isOverlayOpen('impressumOverlay')
        || isOverlayOpen('rankingOverlay');
}


function isOverlayOpen(id) {
    const el = document.getElementById(id);
    return el && !el.classList.contains('d-none');
}


function shouldCloseSettingsByOutsideClick(e) {
    const settings = document.getElementById('settingsOverlay');
    const burgerBtn = document.getElementById('burgerBtn');
    if (!settings) return false;
    return settings.classList.contains('open')
        && !settings.contains(e.target)
        && e.target !== burgerBtn;
}


function shouldCloseBurgerByOutsideClick(e) {
    const burger = document.getElementById('burgerMenu');
    const burgerBtn = document.getElementById('burgerBtn');
    if (!burger) return false;
    return burger.classList.contains('open')
        && !burger.contains(e.target)
        && e.target !== burgerBtn;
}


function bootstrapUi() {
    window.addEventListener('load', onWindowLoad);
}