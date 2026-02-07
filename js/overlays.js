/**
 * Opens the story overlay.
 *
 * @returns {void}
 */
function openStoryOverlay() {
    openOverlay('storyOverlay', { rememberBurger: true });
}


/**
 * Closes the story overlay.
 *
 * @returns {void}
 */
function closeStoryOverlay() {
    closeOverlay('storyOverlay', { rememberBurger: true });
}


/**
 * Opens the key help overlay.
 *
 * @returns {void}
 */
function openKeyHelpOverlay() {
    openOverlay('keyHelpOverlay', { rememberBurger: true });
}


/**
 * Closes the key help overlay.
 *
 * @returns {void}
 */
function closeKeyHelpOverlay() {
    closeOverlay('keyHelpOverlay', { rememberBurger: true });
}


/**
 * Opens the ranking overlay and renders the ranking list.
 *
 * @returns {void}
 */
function openRankingOverlay() {
    openOverlay('rankingOverlay', {
        rememberBurger: true,
        onOpen: () => {
            renderRankingList();
            setClearRankingState();
        }
    });
}


/**
 * Closes the ranking overlay.
 *
 * @returns {void}
 */
function closeRankingOverlay() {
    closeOverlay('rankingOverlay', { rememberBurger: true });
}


/**
 * Opens the ranking clear confirmation overlay.
 *
 * @returns {void}
 */
function openRankingClearConfirm() {
    openOverlay('rankingClearOverlay', { onOpen: setRankingClearConfirmTexts });
}


/**
 * Closes the ranking clear confirmation overlay.
 *
 * @returns {void}
 */
function closeRankingClearConfirm() {
    closeOverlay('rankingClearOverlay');
}


/**
 * Opens the impressum overlay.
 *
 * @returns {void}
 */
function openImpressumOverlay() {
    openOverlay('impressumOverlay', { rememberBurger: true });
}


/**
 * Closes the impressum overlay.
 *
 * @returns {void}
 */
function closeImpressumOverlay() {
    closeOverlay('impressumOverlay', { rememberBurger: true });
}


/**
 * Opens the language modal.
 *
 * @returns {void}
 */
function openLangModal() {
    openOverlay('langOverlay', { onOpen: markLangButtonActive });
}


/**
 * Opens the win overlay.
 *
 * @returns {void}
 */
function openWinOverlay() {
    openOverlay('winOverlay');
}


/**
 * Closes the win overlay.
 *
 * @returns {void}
 */
function closeWinOverlay() {
    closeOverlay('winOverlay');
}


/**
 * Opens the game over overlay.
 *
 * @returns {void}
 */
function openGameOverOverlay() {
    openOverlay('gameOverOverlay');
}


/**
 * Closes the game over overlay.
 *
 * @returns {void}
 */
function closeGameOverOverlay() {
    closeOverlay('gameOverOverlay');
}


/**
 * Marks the language toggle button as active.
 *
 * @returns {void}
 */
function markLangButtonActive() {
    getEl('langToggle')?.classList.add('is-active');
}


/**
 * Closes the language modal.
 *
 * @returns {void}
 */
function closeLangModal() {
    closeOverlay('langOverlay', { onClose: unmarkLangButtonActive });
}


/**
 * Unmarks the language toggle button as active.
 *
 * @returns {void}
 */
function unmarkLangButtonActive() {
    getEl('langToggle')?.classList.remove('is-active');
}


/**
 * Closes an end overlay and runs a callback afterwards.
 *
 * @param {string} overlayId
 * @param {Function} after
 * @returns {void}
 */
function closeEndOverlayThen(overlayId, after) {
    runEndOverlayClose(overlayId, after);
}


/**
 * Runs coordinated close logic for end overlays (DOM + canvas fade).
 *
 * @param {string} overlayId
 * @param {Function} after
 * @returns {void}
 */
function runEndOverlayClose(overlayId, after) {
    const ov = getEl(overlayId);
    if (!ov) return;
    const done = createBarrier(2, () => finalizeEndClose(ov, after));
    startDomFadeOut(ov, done);
    startCanvasFadeOut(overlayId, done);
}


/**
 * Creates a barrier callback that triggers after being called a given number of times.
 *
 * @param {number} count
 * @param {Function} afterAll
 * @returns {Function}
 */
function createBarrier(count, afterAll) {
    let left = count;
    return function markDone() {
        left -= 1;
        if (left === 0) afterAll();
    };
}


/**
 * Finalizes end overlay close and runs the optional callback.
 *
 * @param {HTMLElement} ov
 * @param {Function} after
 * @returns {void}
 */
function finalizeEndClose(ov, after) {
    finalizeOverlayHide(ov);
    after?.();
}


/**
 * Starts the DOM fade-out for an overlay.
 *
 * @param {HTMLElement} ov
 * @param {Function} done
 * @returns {void}
 */
function startDomFadeOut(ov, done) {
    ov.classList.remove('is-open');
    waitOverlayFadeOut(ov, done);
}


/**
 * Starts the canvas fade-out for overlays that use canvas screens.
 *
 * @param {string} overlayId
 * @param {Function} done
 * @returns {void}
 */
function startCanvasFadeOut(overlayId, done) {
    const screen = getCanvasScreenForOverlay(overlayId);
    if (!screen?.hideSmooth) return done();
    try {
        screen.hideSmooth(done);
    } catch (e) {
        done();
    }
}


/**
 * Returns the canvas screen instance that belongs to an overlay id.
 *
 * @param {string} overlayId
 * @returns {Object|null}
 */
function getCanvasScreenForOverlay(overlayId) {
    if (!window.world) return null;
    if (overlayId === 'winOverlay') return world.winscreen;
    if (overlayId === 'gameOverOverlay') return world.endscreen;
    return null;
}