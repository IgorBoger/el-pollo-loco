bootstrapUi();


/**
 * Handles initial UI setup once the window load event fires.
 * Binds all UI events and installs global guards/listeners.
 *
 * @returns {void}
 */
function onWindowLoad() {
    initUiOnLoad();
    bindKeyboardEvents();
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


/**
 * Initializes UI state on load (translations, viewport, mobile buttons, audio icons).
 *
 * @returns {void}
 */
function initUiOnLoad() {
    initTranslations();
    handleViewportChange();
    addMobileButtonsFunction();
    setAudioIcons();
}


/**
 * Sets the initial icon sources for music and sound based on current mute states.
 *
 * @returns {void}
 */
function setAudioIcons() {
    setIconSrc('musicIcon', isMusicMuted ? 'img/mute.png' : 'img/speaker.png');
    setIconSrc('soundIcon', isSoundMuted ? 'img/mute.png' : 'img/speaker.png');
}


/**
 * Sets the "src" attribute for an element by id, if the element exists.
 *
 * @param {string} id - The element id.
 * @param {string} src - The image source path to set.
 * @returns {void}
 */
function setIconSrc(id, src) {
    const el = document.getElementById(id);
    if (el) el.src = src;
}


/**
 * Binds base game UI events like restart and pause.
 *
 * @returns {void}
 */
function bindBaseGameUiEvents() {
    bindClick('restartGameBtn', restartGame);
    bindClick('pauseBtn', togglePause);
}


/**
 * Binds a click handler to an element by id, if the element exists.
 *
 * @param {string} id - The element id.
 * @param {Function} fn - The click handler function.
 * @returns {void}
 */
function bindClick(id, fn) {
    document.getElementById(id)?.addEventListener('click', fn);
}


/**
 * Binds burger menu open/close button events.
 *
 * @returns {void}
 */
function bindBurgerUiEvents() {
    bindClick('burgerBtn', onBurgerButtonClick);
    bindClick('burgerClose', closeBurgerMenu);
}


/**
 * Handles burger button clicks and prevents global outside-close interference.
 *
 * @param {MouseEvent} e
 * @returns {void}
 */
function onBurgerButtonClick(e) {
    e.stopPropagation();
    toggleBurgerMenu();
}


/**
 * Binds UI events for toggling music and sound effects.
 *
 * @returns {void}
 */
function bindAudioToggleEvents() {
    bindClick('musicToggle', toggleMusic);
    bindClick('soundToggle', toggleSound);
}


/**
 * Binds events for opening and closing the settings overlay.
 *
 * @returns {void}
 */
function bindSettingsOverlayEvents() {
    bindClick('openSettings', openSettingsOverlay);
    bindClick('closeSettings', closeSettingsOverlay);
}


/**
 * Binds an event listener to an element by id, if the element exists.
 *
 * @param {string} id - The element id.
 * @param {string} type - The event type (e.g. "click").
 * @param {Function} fn - The handler function.
 * @returns {void}
 */
function bindEvent(id, type, fn) {
    document.getElementById(id)?.addEventListener(type, fn);
}


/**
 * Binds viewport-related events that require recalculating layout/canvas scaling.
 *
 * @returns {void}
 */
function bindViewportEvents() {
    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('orientationchange', handleViewportChange);
    document.addEventListener('fullscreenchange', handleViewportChange);
}


/**
 * Bootstraps UI initialization by registering the window load handler.
 *
 * @returns {void}
 */
function bootstrapUi() {
    window.addEventListener('load', onWindowLoad);
}