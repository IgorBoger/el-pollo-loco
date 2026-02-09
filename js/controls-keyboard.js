/**
 * Binds keyboard listeners for desktop controls (keydown/keyup).
 *
 * @returns {void}
 */
function bindKeyboardEvents() {
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("keydown", handleKeyDown);
}


/**
 * Handles key release events and updates keyboard state accordingly.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleKeyUp(event) {
    releaseMovementKeys(event);
    releaseActionKeys(event);
}


/**
 * Handles movement-related key releases.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function releaseMovementKeys(event) {
    if (event.key === "ArrowLeft") keyBaord.LEFT = false;
    if (event.key === "ArrowRight") keyBaord.RIGHT = false;
}


/**
 * Handles action-related key releases.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function releaseActionKeys(event) {
    if (event.key === " ") keyBaord.SPACE = false;
    if (event.key === "d") keyBaord.THROW = false;
}


/**
 * Handles key press events and updates keyboard state accordingly.
 * Also closes open overlays when Escape is pressed.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleKeyDown(event) {
    handleMovementKeys(event);
    handleActionKeys(event);
    overlayClosingWithESC(event);
}


/**
 * Handles movement-related keyboard input.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleMovementKeys(event) {
    if (event.key === "ArrowLeft") keyBaord.LEFT = true;
    // if (event.key === "ArrowRight") keyBaord.RIGHT = true;
    if (event.key === "ArrowRight") {
        if (isRightLocked()) return;
        keyBaord.RIGHT = true;
    }
}


/**
 * Handles action-related keyboard input.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleActionKeys(event) {
    if (event.key === " ") keyBaord.SPACE = true;
    if (event.key === "d") keyBaord.THROW = true;
}


/**
 * Closes open overlays when Escape is pressed.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function overlayClosingWithESC(event) {
    if (event.key !== "Escape") return;
    if (typeof isOverlayOpen === 'function' && isOverlayOpen('rankingClearOverlay')) {
        closeRankingClearConfirm();
        return;
    }
    closeEscapeUiLayers();
}


/**
 * Closes all UI layers that should react to Escape.
 *
 * @returns {void}
 */
function closeEscapeUiLayers() {
    if (closeUiOverlaysByPriority()) return;
    if (isSettingsOpen()) return closeSettingsOverlay();
    closeBurgerMenu();
}


/**
 * Closes open overlays in priority order (top-most first).
 *
 * @returns {boolean} True if an overlay was closed.
 */
function closeUiOverlaysByPriority() {
    if (!canUseOverlayOpen()) return false;

    if (isOverlayOpen('langOverlay')) { closeLangModal(); return true; }
    if (isOverlayOpen('rankingOverlay')) { closeRankingOverlay(); return true; }
    if (isOverlayOpen('rankingClearOverlay')) { closeRankingClearConfirm(); return true; }
    if (isOverlayOpen('keyHelpOverlay')) { closeKeyHelpOverlay(); return true; }
    if (isOverlayOpen('storyOverlay')) { closeStoryOverlay(); return true; }
    if (isOverlayOpen('impressumOverlay')) { closeImpressumOverlay(); return true; }

    return false;
}


/**
 * Checks whether the overlay-open helper exists.
 *
 * @returns {boolean}
 */
function canUseOverlayOpen() {
    return typeof isOverlayOpen === 'function';
}


/**
 * Checks whether the settings overlay is currently open.
 *
 * @returns {boolean}
 */
function isSettingsOpen() {
    const el = document.getElementById('settingsOverlay');
    return !!el && !el.classList.contains('d-none') && el.classList.contains('open');
}


/**
 * Checks whether RIGHT input is temporarily locked.
 *
 * @returns {boolean}
 */
function isRightLocked() {
    return performance.now() < (keyBaord.rightLockedUntil || 0);
}