/**
 * Binds all overlay open/close related events.
 * @returns {void}
 */
function bindOverlayOpenCloseEvents() {
    bindStoryOverlayEvents();
    bindKeyHelpOverlayEvents();
    bindImpressumOverlayEvents();
    bindRankingOverlayEvents();
    bindRankingClearOverlayEvents();
    bindLangModalOverlayEvents();
}


/**
 * Binds "click outside to close" behavior for overlays.
 * @returns {void}
 */
function bindOverlayOutsideCloseEvents() {
    bindOutsideClose('storyOverlay', '#storyOverlay .story-card', closeStoryOverlay);
    bindOutsideClose('keyHelpOverlay', '#keyHelpOverlay .key-help-card', closeKeyHelpOverlay);
    bindOutsideClose('langOverlay', '#langOverlay .modal-card', closeLangModal);
    bindOutsideClose('impressumOverlay', '#impressumOverlay .impressum-card', closeImpressumOverlay);
    bindOutsideClose('rankingOverlay', '#rankingOverlay .ranking-card', closeRankingOverlay);
}


/**
 * Binds delegated click handling for language option buttons inside the language overlay.
 * @returns {void}
 */
function bindOverlayContentDelegation() {
    const container = document.querySelector('#langOverlay .modal-content');
    if (!container) return;
    container.addEventListener('click', onLangModalContentClick);
}


/**
 * Handles delegated clicks inside the language modal content.
 * @param {MouseEvent} e
 * @returns {void}
 */
function onLangModalContentClick(e) {
    onLangOptionClick(e);
    e.stopPropagation();
}


/**
 * Binds endscreen-related button events (game over and win screens).
 * @returns {void}
 */
function bindEndscreenButtons() {
    bindGameOverButtons();
    bindWinButtons();
}


/**
 * Binds button events for the game over overlay.
 * @returns {void}
 */
function bindGameOverButtons() {
    bindClick('restartBtn', onGameOverRestartClick);
    bindClick('homeBtn', onGameOverHomeClick);
}


/**
 * Handles the game over restart action (close overlay then quick restart).
 * @returns {void}
 */
function onGameOverRestartClick() {
    closeEndOverlayThen('gameOverOverlay', quickRestartGame);
}


/**
 * Handles the game over home action (close overlay then return to start screen).
 * @returns {void}
 */
function onGameOverHomeClick() {
    closeEndOverlayThen('gameOverOverlay', goToStartScreen);
}


/**
 * Binds button events for the win overlay.
 * @returns {void}
 */
function bindWinButtons() {
    bindClick('nextLevelBtn', onNextLevelClick);
    bindClick('winHomeBtn', onWinHomeClick);
}


/**
 * Handles the next level button click.
 * @returns {void}
 */
function onNextLevelClick() {
    if (isLastLevelReached()) return closeEndOverlayThen('winOverlay', backToStartAfterFinish);
    setNextLevelDefinition();
    closeEndOverlayThen('winOverlay', quickRestartGame);
}


/**
 * Returns to start after finishing the last level.
 * @returns {void}
 */
function backToStartAfterFinish() {
    resetToFirstLevel();
    goToStartScreen();
}



/**
 * Sets the win overlay UI for the finish state.
 * @returns {void}
 */
function setWinOverlayModeFinish() {
    setText('winQuestion', getFinishQuestionText());
    setText('winHome', getFinishHomeText());
    document.getElementById('nextLevelBtn')?.classList.add('d-none');
}


/**
 * Sets the win overlay UI for the normal next level state.
 * @returns {void}
 */
function setWinOverlayModeNextLevel() {
    applyTranslations?.();
    document.getElementById('nextLevelBtn')?.classList.remove('d-none');
}


/**
 * Returns the translated finish question text.
 * @returns {string}
 */
function getFinishQuestionText() {
    const t = getMergedPack?.(currentLanguage) || {};
    return t.winFinishQuestion || 'You finished the game!';
}


/**
 * Returns the translated finish home button text.
 * @returns {string}
 */
function getFinishHomeText() {
    const t = getMergedPack?.(currentLanguage) || {};
    return t.winFinishHome || 'Back to Start';
}


/**
 * Switches the current level definition to the next level in the list.
 * @returns {void}
 */
function setNextLevelDefinition() {
    if (!canSwitchToNextLevel()) return;
    advanceLevelIndex();
    applyCurrentLevelDefinition();
}


/**
 * Checks whether level switching is possible.
 * @returns {boolean}
 */
function canSwitchToNextLevel() {
    return Array.isArray(levels) && levels.length > 0;
}


/**
 * Advances the level index (wraps around).
 * @returns {void}
 */
function advanceLevelIndex() {
    if (currentLevelIndex >= levels.length - 1) return;
    currentLevelIndex++;
}


/**
 * Applies the current level definition from the index.
 * @returns {void}
 */
function applyCurrentLevelDefinition() {
    currentLevelDefinition = levels[currentLevelIndex];
    setCurrentLevelIndex?.(currentLevelIndex);
}


/**
 * Handles the win home action (close overlay then return to start screen).
 * @returns {void}
 */
function onWinHomeClick() {
    persistLevelProgressAfterWin();
    closeEndOverlayThen('winOverlay', goToStartScreen);
}


/**
 * Persists unlocked progress after winning a level.
 * @returns {void}
 */
function persistLevelProgressAfterWin() {
    setCurrentLevelIndex?.(getUnlockedLevelIndexAfterWin());
}


/**
 * Returns the unlocked level index after winning the current level.
 * @returns {number}
 */
function getUnlockedLevelIndexAfterWin() {
    return Math.min(currentLevelIndex + 1, levels.length - 1);
}


/**
 * Installs a global click handler for closing UI panels when clicking outside.
 * @returns {void}
 */
function bindGlobalOutsideClose() {
    document.addEventListener('click', outsideCloseHandler);
}


/**
 * Binds events for opening and closing the language modal overlay.
 * @returns {void}
 */
function bindLangModalOverlayEvents() {
    bindClick('langToggle', openLangModal);
    bindClick('langClose', closeLangModal);
}


/**
 * Binds events for opening and closing the story overlay.
 * @returns {void}
 */
function bindStoryOverlayEvents() {
    bindClick('aboutGameBtn', openStoryOverlay);
    bindClick('closeStory', closeStoryOverlay);
}


/**
 * Binds events for opening and closing the key help overlay.
 * @returns {void}
 */
function bindKeyHelpOverlayEvents() {
    bindClick('keyHelpBtn', openKeyHelpOverlay);
    bindClick('keyHelpClose', closeKeyHelpOverlay);
}


/**
 * Binds events for opening and closing the impressum overlay.
 * @returns {void}
 */
function bindImpressumOverlayEvents() {
    bindClick('impressumBtn', openImpressumOverlay);
    bindClick('impressumClose', closeImpressumOverlay);
}


/**
 * Binds events for opening and closing the ranking overlay.
 * @returns {void}
 */
function bindRankingOverlayEvents() {
    bindClick('rankingListBtn', openRankingOverlay);
    bindClick('rankingClose', closeRankingOverlay);
}


/**
 * Binds events for ranking clear confirmation overlay actions.
 * @returns {void}
 */
function bindRankingClearOverlayEvents() {
    bindClick('rankingClear', onClearRankingClick);
    bindClick('rankingClearOk', onRankingClearConfirm);
    bindClick('rankingClearCancel', onRankingClearCancel);
    bindEvent('rankingClearOverlay', 'click', onRankingClearOverlayClick);
}


/**
 * Handles global outside clicks to close the settings or burger menu when appropriate.
 * @param {MouseEvent} e - The click event.
 * @returns {void}
 */
function outsideCloseHandler(e) {
    if (shouldIgnoreOutsideClose()) return;
    if (shouldCloseSettingsByOutsideClick(e)) {
        closeSettingsOverlay();
        return;
    }
    if (shouldCloseBurgerByOutsideClick(e)) closeBurgerMenu();
}


/**
 * Determines whether the settings overlay should close due to an outside click.
 * @param {MouseEvent} e - The click event.
 * @returns {boolean} True if settings should close.
 */
function shouldCloseSettingsByOutsideClick(e) {
    const settings = document.getElementById('settingsOverlay');
    const burgerBtn = document.getElementById('burgerBtn');
    if (!settings) return false;
    return settings.classList.contains('open')
        && !settings.contains(e.target)
        && !burgerBtn?.contains(e.target);
}


/**
 * Determines whether the burger menu should close due to an outside click.
 * @param {MouseEvent} e - The click event.
 * @returns {boolean} True if burger menu should close.
 */
function shouldCloseBurgerByOutsideClick(e) {
    const burger = document.getElementById('burgerMenu');
    const burgerBtn = document.getElementById('burgerBtn');
    if (!burger) return false;
    return burger.classList.contains('open')
        && !burger.contains(e.target)
        && !burgerBtn?.contains(e.target);
}


/**
 * Handles language option click events.
 * @param {MouseEvent} e
 * @returns {void}
 */
function onLangOptionClick(e) {
    const lang = getLangFromClick(e);
    if (!lang) return;
    applyLanguageChange(lang);
    closeLangModal();
}


/**
 * Extracts the language code from a language option click.
 * @param {MouseEvent} e
 * @returns {string|undefined}
 */
function getLangFromClick(e) {
    const btn = e.target.closest('.lang-opt');
    return btn?.getAttribute('data-lang');
}


/**
 * Applies a language change using the available language handler.
 * @param {string} lang
 * @returns {void}
 */
function applyLanguageChange(lang) {
    if (typeof setLanguage === 'function') return setLanguage(lang);
    setLanguageFallback(lang);
}


/**
 * Applies a fallback language change.
 * @param {string} lang
 * @returns {void}
 */
function setLanguageFallback(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', currentLanguage);
    applyTranslations?.();
}