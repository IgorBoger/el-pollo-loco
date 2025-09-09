let canvas;
let world;
let keyBaord = new KeyBaord();
const buttons = [
    { id: 'btnLeft', key: 'LEFT' },
    { id: 'btnRight', key: 'RIGHT' },
    { id: 'btnJump', key: 'SPACE' },
    { id: 'btnThrow', key: 'THROW' }
];
let isMusicMuted = localStorage.getItem('isMusicMuted') === 'true';
let isSoundMuted = localStorage.getItem('isSoundMuted') === 'true';
let currentLanguage = localStorage.getItem('language') || 'DE';



function init() {
    canvas = document.getElementById('canvas');
    setupHiDPICanvas();
    world = new World(canvas, keyBaord);
    console.log('My Caracter is ', world);

    Object.entries(world.sounds).forEach(([name, sound]) => {
        if (sound instanceof Audio) {
            if (name === 'background') {
                sound.muted = isMusicMuted;
            } else {
                sound.muted = isSoundMuted;
            }
        }
    });
}


function startGame() {
    console.log('gecklickt');
    document.getElementById('startScreen').classList.add('d-none');
    init();
    if (world?.sounds?.background) {
        const bg = world.sounds.background;
        bg.loop = true;
        bg.volume = 0.1;
        bg.muted = isMusicMuted;

        if (!isMusicMuted) {
            bg.play().catch((e) => console.warn('Musikstart fehlgeschlagen:', e));
        }
    }
}


function restartGame() {
    startGame();
}


// Burger Menü ein-/ausblenden
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


// Datei: game.js — Funktion: outsideCloseHandler (NEU)
function outsideCloseHandler(e) {
    const burger = document.getElementById('burgerMenu');
    const settings = document.getElementById('settingsOverlay');
    const burgerBtn = document.getElementById('burgerBtn');

    // 1) Settings offen? → Klick NICHT im Settings & NICHT auf Burger-Button ⇒ sanft schließen
    if (settings && settings.classList.contains('open')
        && !settings.contains(e.target) && e.target !== burgerBtn) {
        closeSettingsOverlay();     // nutzt deine bestehende sanfte Animation
        return;                     // nur eins schließen pro Klick
    }

    // 2) Burger offen? → Klick NICHT im Burger & NICHT auf Burger-Button ⇒ sanft schließen
    if (burger && burger.classList.contains('open')
        && !burger.contains(e.target) && e.target !== burgerBtn) {
        closeBurgerMenu();          // nutzt deine bestehende sanfte Animation
    }
}


function toggleMusic() {
    isMusicMuted = !isMusicMuted;
    localStorage.setItem('isMusicMuted', isMusicMuted);
    const icon = document.getElementById('musicIcon');
    if (icon) icon.src = isMusicMuted ? 'img/mute.png' : 'img/speaker.png';
    const bg = world?.sounds?.background;
    if (bg) {
        bg.muted = isMusicMuted;
        if (!isMusicMuted) {
            bg.play().catch((e) => console.warn('Musik konnte nicht gestartet werden:', e));
        } else {
            bg.pause();
            bg.currentTime = 0; // optional: bei jedem Mute zurück
        }
    }

}

function toggleSound() {
    isSoundMuted = !isSoundMuted;
    localStorage.setItem('isSoundMuted', isSoundMuted);
    const icon = document.getElementById('soundIcon');
    if (icon) icon.src = isSoundMuted ? 'img/mute.png' : 'img/speaker.png';
    if (!world || !world.sounds) return;
    for (const [name, sound] of Object.entries(world.sounds)) {
        if (name !== 'background' && sound instanceof Audio) {
            sound.muted = isSoundMuted;
        }
    }
}


function toggleLanguage() {
    currentLanguage = currentLanguage === 'DE' ? 'EN' : 'DE';
    localStorage.setItem('language', currentLanguage);
    document.getElementById('langToggle').textContent = currentLanguage;
    // 👉 Optional: hier kannst du Texte umstellen
}


document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft") {
        keyBaord.LEFT = false;
    }
    if (event.key === "ArrowRight") {
        keyBaord.RIGHT = false;
    }
    if (event.key === " ") {
        keyBaord.SPACE = false;
    }
    if (event.key === "ArrowUp") {
        console.log('up');
        keyBaord.UP = false;
        console.log('up is :' + keyBaord.UP);
        console.log(keyBaord);
    }
    if (event.key === "ArrowDown") {
        console.log('down');
        keyBaord.DOWN = false;
        console.log('down is :' + keyBaord.DOWN);
        console.log(keyBaord);
    }
    if (event.key === "d") {
        // console.log('throw');
        keyBaord.THROW = false;
        // console.log('throw is :' + keyBaord.THROW);
        // console.log(keyBaord);
    }
});


document.addEventListener("keydown", function (event) {
    // console.log(event.key);

    if (event.key === "ArrowLeft") {
        keyBaord.LEFT = true;
    }
    if (event.key === "ArrowRight") {
        keyBaord.RIGHT = true;
    }
    if (event.key === " ") {
        keyBaord.SPACE = true;
    }
    if (event.key === "ArrowUp") {
        console.log('up');
        keyBaord.UP = true;
        console.log('up is :' + keyBaord.UP);
        console.log(keyBaord);
    }
    if (event.key === "ArrowDown") {
        console.log('down');
        keyBaord.DOWN = true;
        console.log('up is :' + keyBaord.DOWN);
        console.log(keyBaord);
    }
    if (event.key === "d") {
        // console.log('throw');
        keyBaord.THROW = true;
        // console.log('throw is :' + keyBaord.THROW);
        // console .log(keyBaor d); 
    }
});


function updateMobileControlsVisibility() {
    // console.log('updateMobileControlsVisibility aufgerufen');
    const mobileControls = document.getElementById('mobileControls');
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 800;

    if (isMobile || isSmallScreen) {
        // console.log('display ist unter 800px ODER mobil');

        mobileControls.classList.remove('d-none');
        mobileControls.classList.add('d-flex');
    } else {
        // console.log('display ist größer als 800px UND nicht mobil');
        mobileControls.classList.remove('d-flex');
        mobileControls.classList.add('d-none');
    }
}


function addMobileButtonsFunction(params) {
    buttons.forEach(btn => {
        const el = document.getElementById(btn.id);
        el.addEventListener('touchstart', () => keyBaord[btn.key] = true);
        el.addEventListener('touchend', () => keyBaord[btn.key] = false);
    });
}


function addMobileButtonsFunction() {
    buttons.forEach(btn => {
        const el = document.getElementById(btn.id);

        ['touchstart', 'mousedown'].forEach(evt =>
            el.addEventListener(evt, () => keyBaord[btn.key] = true, { passive: true })
        );

        ['touchend', 'mouseup', 'mouseleave'].forEach(evt =>
            el.addEventListener(evt, () => keyBaord[btn.key] = false, { passive: true })
        );
    });
}


window.addEventListener('load', () => {
    updateMobileControlsVisibility();
    addMobileButtonsFunction();
    document.getElementById('restartGame')?.addEventListener('click', restartGame);
    
    document.getElementById('burgerBtn')?.addEventListener('click', toggleBurgerMenu);
    document.getElementById('burgerClose')?.addEventListener('click', closeBurgerMenu);
    document.getElementById('openSettings')?.addEventListener('click', openSettingsOverlay);
    document.getElementById('closeSettings')?.addEventListener('click', closeSettingsOverlay);
    // Datei: game.js — im vorhandenen window.addEventListener('load', ...) GANZ AM ENDE ergänzen:
    document.addEventListener('click', outsideCloseHandler);


    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);
    const musicIcon = document.getElementById('musicIcon');
    const soundIcon = document.getElementById('soundIcon');
    if (musicIcon) musicIcon.src = isMusicMuted ? 'img/mute.png' : 'img/speaker.png';
    if (soundIcon) soundIcon.src = isSoundMuted ? 'img/mute.png' : 'img/speaker.png';
    document.getElementById('langToggle').textContent = currentLanguage;
});


window.addEventListener('resize', () => {
    updateMobileControlsVisibility();
});


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


function setupHiDPICanvas() {
    const c = document.getElementById('canvas');
    const ctx = c.getContext('2d');
    const BASE_W = 720, BASE_H = 480;

    function fit() {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        // sichtbare CSS-Größe des Canvas (nicht per JS setzen!)
        const cssW = Math.round(c.clientWidth);
        const cssH = Math.round(c.clientHeight);

        // physische Puffergröße in Pixeln
        const pxW = cssW * dpr;
        const pxH = cssH * dpr;

        // nur neu setzen wenn nötig (spart Arbeit)
        if (c.width !== pxW || c.height !== pxH) {
            c.width = pxW;
            c.height = pxH;
        }

        // Koordinatensystem skalieren: 720x480 -> füllt cssW/cssH exakt
        const scaleX = pxW / BASE_W;
        const scaleY = pxH / BASE_H;
        ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
        ctx.imageSmoothingEnabled = true;
    }

    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    document.addEventListener('fullscreenchange', fit);
    fit(); // initial
}