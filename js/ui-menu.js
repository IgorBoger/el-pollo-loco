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
 * Toggles fullscreen mode for the game container.
 *
 * @returns {void}
 */
function toggleFullscreen() {
    const el = document.getElementById('gameContainer');
    if (document.fullscreenElement) {
        document.exitFullscreen?.();
    } else {
        (el.requestFullscreen
            || el.webkitRequestFullscreen
            || el.msRequestFullscreen
            || el.mozRequestFullScreen
        )?.call(el);
    }
}