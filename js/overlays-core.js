/**
 * Opens an overlay and optionally remembers the burger menu state.
 *
 * @param {string} overlayId
 * @param {Object} [opts={}]
 * @param {boolean} [opts.rememberBurger]
 * @param {Function} [opts.onOpen]
 * @returns {void}
 */
function openOverlay(overlayId, opts = {}) {
    if (opts.rememberBurger) rememberBurgerState();
    if (opts.rememberBurger) closeBurgerIfRemembered();
    if (typeof opts.onOpen === 'function') opts.onOpen();
    showOverlay(overlayId);
}


/**
 * Displays an overlay element and triggers the open animation.
 *
 * @param {string} overlayId
 * @returns {void}
 */
function showOverlay(overlayId) {
    const ov = getEl(overlayId);
    if (!ov) return;
    prepareOverlayShow(ov);
    requestAnimationFrame(() => ov.classList.add('is-open'));
}


/**
 * Prepares an overlay element to be shown.
 *
 * @param {HTMLElement} ov
 * @returns {void}
 */
function prepareOverlayShow(ov) {
    ov.classList.remove('d-none');
    ov.classList.add('d-flex');
}


/**
 * Closes an overlay and optionally restores the burger menu state.
 *
 * @param {string} overlayId
 * @param {Object} [opts={}]
 * @param {boolean} [opts.rememberBurger]
 * @param {Function} [opts.onClose]
 * @returns {void}
 */
function closeOverlay(overlayId, opts = {}) {
    hideOverlay(overlayId);
    if (opts.rememberBurger) restoreBurgerIfRemembered();
    if (typeof opts.onClose === 'function') opts.onClose();
}


/**
 * Starts hiding an overlay and waits for the fade-out transition.
 *
 * @param {string} overlayId
 * @returns {void}
 */
function hideOverlay(overlayId) {
    const ov = getEl(overlayId);
    if (!ov) return;
    ov.classList.remove('is-open');
    waitOverlayFadeOut(ov, () => finalizeOverlayHide(ov));
}


/**
 * Finalizes overlay hiding by applying display classes.
 *
 * @param {HTMLElement} ov
 * @returns {void}
 */
function finalizeOverlayHide(ov) {
    ov.classList.remove('d-flex');
    ov.classList.add('d-none');
}


/**
 * Returns an element by id.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function getEl(id) {
    return document.getElementById(id);
}


/**
 * Waits for overlay fade-out to complete and then runs a callback.
 *
 * @param {HTMLElement} ov
 * @param {Function} done
 * @returns {void}
 */
function waitOverlayFadeOut(ov, done) {
    const finish = createFinishHandler(ov, done);
    bindOverlayTransitionEnd(ov, finish);
    setFadeOutFallback(finish);
}


/**
 * Creates a transition end handler that ensures the callback runs only once.
 *
 * @param {HTMLElement} ov
 * @param {Function} done
 * @returns {Function}
 */
function createFinishHandler(ov, done) {
    let finished = false;
    return function finish() {
        if (finished) return;
        finished = true;
        ov.removeEventListener('transitionend', finish);
        done();
    };
}


/**
 * Binds a transition end listener for an overlay element.
 *
 * @param {HTMLElement} ov
 * @param {Function} finish
 * @returns {void}
 */
function bindOverlayTransitionEnd(ov, finish) {
    ov.addEventListener('transitionend', (e) => {
        if (e.target === ov) finish();
    });
}


/**
 * Sets a fallback timeout to ensure overlay fade-out completes.
 *
 * @param {Function} finish
 * @returns {void}
 */
function setFadeOutFallback(finish) {
    setTimeout(finish, 220);
}


/**
 * Closes an overlay and runs a callback after the fade-out finishes.
 *
 * @param {string} overlayId
 * @param {Function} after
 * @returns {void}
 */
function closeOverlayThen(overlayId, after) {
    const ov = getEl(overlayId);
    if (!ov) return;
    ov.classList.remove('is-open');
    waitOverlayFadeOut(ov, () => {
        finalizeOverlayHide(ov);
        if (after) after();
    });
}


/**
 * Stores whether the burger menu was open before opening an overlay.
 *
 * @returns {void}
 */
function rememberBurgerState() {
    window._reopenBurgerAfterOverlay = isBurgerOpen();
}


/**
 * Checks whether the burger menu is currently open.
 *
 * @returns {boolean}
 */
function isBurgerOpen() {
    return getEl('burgerMenu')?.classList.contains('open') || false;
}


/**
 * Closes the burger menu if it was previously remembered as open.
 *
 * @returns {void}
 */
function closeBurgerIfRemembered() {
    if (!window._reopenBurgerAfterOverlay) return;
    closeBurgerMenu();
}


/**
 * Restores the burger menu if it was remembered as open.
 *
 * @returns {void}
 */
function restoreBurgerIfRemembered() {
    if (!window._reopenBurgerAfterOverlay) return;
    toggleBurgerMenu();
    window._reopenBurgerAfterOverlay = false;
}


/**
 * Binds a click-outside-to-close behavior for an overlay.
 *
 * @param {string} overlayId
 * @param {string} cardSelector
 * @param {Function} onClose
 * @returns {void}
 */
function bindOutsideClose(overlayId, cardSelector, onClose) {
    const ov = getEl(overlayId);
    if (!ov) return;
    ov.addEventListener('click', (e) => {
        const card = document.querySelector(cardSelector);
        if (card && !card.contains(e.target)) onClose();
        e.stopPropagation();
    });
}