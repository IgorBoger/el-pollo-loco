

/**
 * Initializes mobile control buttons and binds input handlers.
 *
 * @returns {void}
 */
function addMobileButtonsFunction() {
    buttons.forEach((btn) => {
        const el = document.getElementById(btn.id);
        if (!el) return;
        bindMobileControl(el, btn.key);
    });
}


/**
 * Binds all interaction handlers to a mobile control button.
 *
 * @param {HTMLElement} el
 * @param {string} actionKey
 * @returns {void}
 */
function bindMobileControl(el, actionKey) {
    preventContextMenu(el);
    bindPointerPressBlock(el);
    bindTouchControls(el, actionKey);
    bindMouseControls(el, actionKey);
}


/**
 * Updates the visibility of mobile controls depending on device and screen size.
 *
 * @returns {void}
 */
function updateMobileControlsVisibility() {
    const mobileControls = getMobileControlsElement();
    if (!mobileControls) return;
    if (shouldShowMobileControls()) return showMobileControls(mobileControls);
    hideMobileControls(mobileControls);
}


/**
 * Returns the mobile controls container element.
 *
 * @returns {HTMLElement|null}
 */
function getMobileControlsElement() {
    return document.getElementById('mobileControls');
}


/**
 * Determines whether mobile controls should be shown.
 *
 * @returns {boolean}
 */
function shouldShowMobileControls() {
    return isMobileDevice() || isSmallScreen() || isTouchInput();
}


/**
 * Detects if the current device likely supports touch input.
 *
 * @returns {boolean}
 */
function isTouchInput() {
    if (window.matchMedia?.('(pointer: coarse)').matches) return true;
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}



/**
 * Checks if the current device is a mobile device.
 *
 * @returns {boolean}
 */
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


/**
 * Checks if the viewport width is considered small.
 *
 * @returns {boolean}
 */
function isSmallScreen() {
    return window.innerWidth < 800;
}


/**
 * Shows the mobile controls element.
 *
 * @param {HTMLElement} mobileControls
 * @returns {void}
 */
function showMobileControls(mobileControls) {
    mobileControls.classList.remove('d-none');
    mobileControls.classList.add('d-flex');
}


/**
 * Hides the mobile controls element.
 *
 * @param {HTMLElement} mobileControls
 * @returns {void}
 */
function hideMobileControls(mobileControls) {
    mobileControls.classList.remove('d-flex');
    mobileControls.classList.add('d-none');
}


/**
 * Prevents the context menu on touch and pointer interactions.
 *
 * @param {HTMLElement} el
 * @returns {void}
 */
function preventContextMenu(el) {
    if (!el) return;
    el.addEventListener('contextmenu', (e) => {
        if (e.pointerType === 'mouse') return;
        e.preventDefault();
        e.stopPropagation();
    }, true);
}


/**
 * Binds pointer press blocking to prevent right-click interactions.
 *
 * @param {HTMLElement} el
 * @returns {void}
 */
function bindPointerPressBlock(el) {
    el.addEventListener('pointerdown', (e) => handlePointerDown(el, e), { passive: false });
    el.addEventListener('pointerup', () => toggleRightClickPressBlock(el, false), { passive: true });
    el.addEventListener('pointerleave', () => toggleRightClickPressBlock(el, false), { passive: true });
    el.addEventListener('pointercancel', () => toggleRightClickPressBlock(el, false), { passive: true });
}


/**
 * Handles pointer down events and detects right mouse button presses.
 *
 * @param {HTMLElement} el
 * @param {PointerEvent} e
 * @returns {void}
 */
function handlePointerDown(el, e) {
    const isRightMouse = e.pointerType === 'mouse' && e.button === 2;
    toggleRightClickPressBlock(el, isRightMouse);
    if (isRightMouse) e.preventDefault();
}


/**
 * Binds touch input handlers for a mobile control.
 *
 * @param {HTMLElement} el
 * @param {string} actionKey
 * @returns {void}
 */
function bindTouchControls(el, actionKey) {
    el.addEventListener('touchstart', (e) => touchPress(el, actionKey, e), { passive: false });
    el.addEventListener('touchend', (e) => touchRelease(el, actionKey, e), { passive: false });
    el.addEventListener('touchcancel', (e) => touchRelease(el, actionKey, e), { passive: false });
}


/**
 * Handles touch press interactions.
 *
 * @param {HTMLElement} el
 * @param {string} actionKey
 * @param {TouchEvent} e
 * @returns {void}
 */
function touchPress(el, actionKey, e) {
    e.preventDefault();
    el.classList.add('is-pressed');
    setKey(actionKey, true);
}


/**
 * Sets a keyboard action state.
 *
 * @param {string} actionKey
 * @param {boolean} state
 * @returns {void}
 */
function setKey(actionKey, state) {
    keyBaord[actionKey] = state;
}


/**
 * Handles touch release interactions.
 *
 * @param {HTMLElement} el
 * @param {string} actionKey
 * @param {TouchEvent} e
 * @returns {void}
 */
function touchRelease(el, actionKey, e) {
    e.preventDefault();
    el.classList.remove('is-pressed');
    setKey(actionKey, false);
}


/**
 * Binds mouse input handlers for a control.
 *
 * @param {HTMLElement} el
 * @param {string} actionKey
 * @returns {void}
 */
function bindMouseControls(el, actionKey) {
    el.addEventListener('mousedown', (e) => mousePress(actionKey, e), { passive: false });
    el.addEventListener('mouseup', (e) => mouseRelease(actionKey, e), { passive: true });
    el.addEventListener('mouseleave', () => setKey(actionKey, false), { passive: true });
}


/**
 * Handles mouse press events.
 *
 * @param {string} actionKey
 * @param {MouseEvent} e
 * @returns {void}
 */
function mousePress(actionKey, e) {
    if (!isLeftClick(e)) { e.preventDefault(); return; }
    setKey(actionKey, true);
}


/**
 * Handles mouse release events.
 *
 * @param {string} actionKey
 * @param {MouseEvent} e
 * @returns {void}
 */
function mouseRelease(actionKey, e) {
    if (isLeftClick(e)) setKey(actionKey, false);
}


/**
 * Resets all mobile control keys.
 *
 * @returns {void}
 */
function resetMobileKeys() {
    buttons.forEach((b) => setKey(b.key, false));
}


/**
 * Adds safety guards to release keys on blur or visibility change.
 *
 * @returns {void}
 */
function addReleaseGuards() {
    window.addEventListener('blur', resetMobileKeys);
    document.addEventListener('visibilitychange', onVisibilityChangeReleaseKeys);
}


/**
 * Releases mobile keys when the document gets hidden.
 *
 * @returns {void}
 */
function onVisibilityChangeReleaseKeys() {
    if (document.hidden) resetMobileKeys();
}


/**
 * Checks whether the mouse event was triggered by the left mouse button.
 *
 * @param {MouseEvent} e
 * @returns {boolean}
 */
function isLeftClick(e) {
    return e && e.button === 0;
}


/**
 * Toggles blocking of right-click visual press effects.
 *
 * @param {HTMLElement} el
 * @param {boolean} isBlocked
 * @returns {void}
 */
function toggleRightClickPressBlock(el, isBlocked) {
    if (!el) return;
    el.classList.toggle('no-active-press', isBlocked);
}