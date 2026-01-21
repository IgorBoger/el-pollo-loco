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


function openSettingsOverlay() {
    const burger = document.getElementById('burgerMenu');
    const settings = document.getElementById('settingsOverlay');
    burger.classList.remove('open');
    setTimeout(() => burger.classList.add('d-none'), 300);
    settings.classList.remove('d-none');
    setTimeout(() => settings.classList.add('open'), 320);
}


function closeSettingsOverlay() {
    const burger = document.getElementById('burgerMenu');
    const settings = document.getElementById('settingsOverlay');
    settings.classList.remove('open');
    setTimeout(() => settings.classList.add('d-none'), 300);
    burger.classList.remove('d-none');
    setTimeout(() => burger.classList.add('open'), 320);
}


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