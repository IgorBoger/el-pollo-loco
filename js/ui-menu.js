/**
 * Toggles the visibility state of the burger menu.
 *
 * @returns {void}
 */
function toggleBurgerMenu() {
    const menu = document.getElementById('burgerMenu');
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
        menu.classList.remove('open');
        setTimeout(() => menu.classList.add('d-none'), 300);
    } else {
        menu.classList.remove('d-none');
        setTimeout(() => menu.classList.add('open'), 10);
    }
}


/**
 * Closes the burger menu if it is currently open.
 *
 * @returns {void}
 */
function closeBurgerMenu() {
    const menu = document.getElementById('burgerMenu');
    if (!menu) return;
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        const onEnd = (e) => {
            if (e.propertyName === 'transform') {
                menu.classList.add('d-none');
                menu.removeEventListener('transitionend', onEnd);
            }
        };
        menu.addEventListener('transitionend', onEnd);
    }
}


/**
 * Opens the settings overlay and hides the burger menu.
 *
 * @returns {void}
 */
function openSettingsOverlay() {
    const burger = document.getElementById('burgerMenu');
    const settings = document.getElementById('settingsOverlay');
    burger.classList.remove('open');
    setTimeout(() => burger.classList.add('d-none'), 300);
    settings.classList.remove('d-none');
    setTimeout(() => settings.classList.add('open'), 320);
}


/**
 * Closes the settings overlay and restores the burger menu.
 *
 * @returns {void}
 */
function closeSettingsOverlay() {
    const burger = document.getElementById('burgerMenu');
    const settings = document.getElementById('settingsOverlay');
    settings.classList.remove('open');
    setTimeout(() => settings.classList.add('d-none'), 300);
    burger.classList.remove('d-none');
    setTimeout(() => burger.classList.add('open'), 320);
}


/**
 * Toggles fullscreen mode.
 * Uses native fullscreen when available, otherwise falls back to iOS-friendly behavior.
 * @returns {void}
 */
function toggleFullscreen() {
    const el = document.getElementById('gameContainer');
    if (!el) return;
    if (shouldUseFakeFullscreen()) return toggleFakeFullscreen(el);
    toggleNativeFullscreen(el);
}


/**
 * Enters or exits native fullscreen for the game container (if supported).
 * @param {HTMLElement} el - The container element to request fullscreen for.
 * @returns {Promise<void>}
 */
function toggleNativeFullscreen(el) {
    if (document.fullscreenElement) return document.exitFullscreen?.();
    (el.requestFullscreen
        || el.webkitRequestFullscreen
        || el.msRequestFullscreen
        || el.mozRequestFullScreen
    )?.call(el);
}


/**
 * Returns true if native fullscreen should be avoided and a fallback should be used.
 * @returns {boolean}
 */
function shouldUseFakeFullscreen() {
    return isIosDevice() && !isStandaloneMode();
}


/**
 * Toggles a CSS-based fullscreen fallback (used for iOS where native fullscreen is limited).
 * @param {HTMLElement} el - The container element to pseudo-fullscreen.
 * @returns {void}
 */
function toggleFakeFullscreen(el) {
    const isOn = el.classList.toggle('is-fake-fullscreen');
    document.body.classList.toggle('no-scroll', isOn);
}


/**
 * Returns true if the current device is iOS/iPadOS (Safari/WebView).
 * @returns {boolean}
 */
function isIosDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}


/**
 * Returns true if the app is running in standalone display mode (PWA).
 * @returns {boolean}
 */
function isStandaloneMode() {
    return window.matchMedia?.('(display-mode: standalone)')?.matches
        || window.navigator.standalone === true;
}