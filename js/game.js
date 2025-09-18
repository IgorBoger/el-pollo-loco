let canvas;
let world;
let keyBaord = new KeyBaord();
const buttons = [
    { id: 'btnLeft', key: 'LEFT' },
    { id: 'btnRight', key: 'RIGHT' },
    { id: 'btnJump', key: 'SPACE' },
    { id: 'btnThrow', key: 'THROW' }
];
let _viewportRaf = null;
// let _viewportRaf = null, _viewportTimer = null;
let isMusicMuted = localStorage.getItem('isMusicMuted') === 'true';
let isSoundMuted = localStorage.getItem('isSoundMuted') === 'true';
let currentLanguage = localStorage.getItem('language') || 'ES';


// Datei: game.js — Block: I18N (NEU)
// Datei: game.js — Block: I18N (ERGÄNZEN)
const I18N = {
    DE: {
        // titleGame: "El Pollo Loco",
        titleGame: "Das verrückte Huhn",
        startButton: "Spiel starten›",
        restartGame: "Spiel neu starten",
        showControls: "Steuerung",
        aboutGame: "Über das Spiel",
        rankingList: "Rangliste",
        labelMusic: "Musik",
        labelSound: "Ton",
        labelLanguage: "Sprache",
        settingsTitle: "Einstellungen",
        langName: "Deutsch",
        langModalTitle: "Sprache",
        mobileJump: "Springen",
        mobileThrow: "Werfen",
    },
    ES: {
        titleGame: "El Pollo Loco",
        startButton: "Iniciar juego ›",
        restartGame: "Reiniciar juego",
        showControls: "Controles",
        aboutGame: "Acerca del juego",
        rankingList: "Clasificación",
        labelMusic: "Música",
        labelSound: "Sonido",
        labelLanguage: "Idioma",
        settingsTitle: "Ajustes",
        langName: "Español",
        langModalTitle: "Idioma",
        mobileJump: "Saltar",
        mobileThrow: "Tirar",
    },
    EN: {
        // titleGame: "El Pollo Loco",
        titleGame: "The Crazy Chicken",
        startButton: "Start Game ›",
        restartGame: "Restart Game",
        showControls: "Controls",
        aboutGame: "About",
        rankingList: "Leaderboard",
        labelMusic: "Music",
        labelSound: "SFX",
        labelLanguage: "Language",
        settingsTitle: "Settings",
        langName: "English",
        langModalTitle: "Language",
        mobileJump: "Jump",
        mobileThrow: "Throw",
    }
};


// function checkOrientation() {
//     const warning = document.getElementById('orientationWarning');
//     if (!warning) return; // ⬅️ Guard

//     if (window.innerHeight > window.innerWidth) {
//         warning.classList.remove('d-none');
//         warning.classList.add('d-flex');
//     } else {
//         warning.classList.remove('d-flex');
//         warning.classList.add('d-none');
//     }
// }


// Datei: game.js — Funktion: applyTranslations (NEU)
function applyTranslations() {
    const t = I18N[currentLanguage] || I18N.ES;
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

    // Titel / Start / Menü
    set('titleGame', t.titleGame);
    set('startButton', t.startButton);
    set('restartGame', t.restartGame);
    set('showControls', t.showControls);
    set('aboutGame', t.aboutGame);
    set('rankingList', t.rankingList);

    // Settings-Bereich
    set('settingsTitle', t.settingsTitle);
    set('labelMusic', t.labelMusic);
    set('labelSound', t.labelSound);
    set('labelLanguage', t.labelLanguage); // falls du das Label wieder nutzt

    // Grüner Sprach-Button → Name statt Kürzel
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.textContent = t.langName;

    // Sprach-Overlay Titel
    set('langModalTitle', t.langModalTitle);

    // Mobile Controls (mit Emoji davor)
    const j = document.getElementById('btnJump');
    if (j) j.textContent = `⤴️ ${t.mobileJump}`;
    const th = document.getElementById('btnThrow');
    if (th) th.textContent = `🧴 ${t.mobileThrow}`;

    // // Sprachcode auf dem grünen Button
    // const langBtn = document.getElementById('langToggle');
    // if (langBtn) langBtn.textContent = currentLanguage;
}



// Datei: game.js — Funktion: setLanguage (NEU)
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', currentLanguage);
    applyTranslations();
}



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
    closeBurgerMenu();

    if (world && typeof world.destroy === "function") {
        world.destroy();
    }

    document.getElementById('startScreen').classList.remove('d-none');
}


function openStoryOverlay() {
    const overlay = document.getElementById('storyOverlay');
    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');
}

function closeStoryOverlay() {
    const overlay = document.getElementById('storyOverlay');
    overlay.classList.remove('d-flex');
    overlay.classList.add('d-none');
}

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
    const langOv = document.getElementById('langOverlay');

    // ✅ Wenn Sprach-Overlay offen ist → NICHTS anderes schließen
    if (langOv && !langOv.classList.contains('d-none')) return;

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


// Datei: game.js — Funktion: openLangModal
function openLangModal() {
    const overlay = document.getElementById('langOverlay');
    if (!overlay) return; // ⬅️ Guard

    const btn = document.getElementById('langToggle');
    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');   // zeigt Overlay + zentriert Card
    btn?.classList.add('is-active');   // Button optisch aktiv (grün)
}


// Datei: game.js — Funktion: closeLangModal
function closeLangModal() {
    const overlay = document.getElementById('langOverlay');
    const btn = document.getElementById('langToggle');
    overlay.classList.remove('d-flex');
    overlay.classList.add('d-none');
    btn?.classList.remove('is-active');
}


// Datei: game.js — Funktion: onLangOptionClick (NEU)
function onLangOptionClick(e) {
    const btn = e.target.closest('.lang-opt');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    if (!lang) return;

    // vorhandene Sprachlogik nutzen
    if (typeof setLanguage === 'function') setLanguage(lang);
    else {
        currentLanguage = lang;
        localStorage.setItem('language', currentLanguage);
        if (typeof applyTranslations === 'function') applyTranslations();
        const langBtn = document.getElementById('langToggle');
        if (langBtn) langBtn.textContent = currentLanguage;
    }

    closeLangModal();
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


// === Zentraler Fit für das Canvas (außerhalb von setupHiDPICanvas) ===
function fitCanvasToCssSize() {
    const c = document.getElementById('canvas');
    const ctx = c.getContext('2d');
    const BASE_W = 720, BASE_H = 480;

    // sichtbare CSS-Größe (nicht per JS setzen!)
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = Math.round(c.clientWidth);
    const cssH = Math.round(c.clientHeight);

    // 🔒 vermeidet harte Resets bei transient 0px
    if (!cssW || !cssH) return;

    // physische Puffergröße
    const pxW = cssW * dpr;
    const pxH = cssH * dpr;

    if (c.width !== pxW || c.height !== pxH) {
        c.width = pxW;
        c.height = pxH;
    }

    const scaleX = pxW / BASE_W;
    const scaleY = pxH / BASE_H;
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    ctx.imageSmoothingEnabled = true;
}


// === Ein zentraler Handler für ALLE Viewport-Änderungen ===
function handleViewportChange() {
    // leicht debouncen, um Kaskaden bei Rotation/Resize zu glätten
    if (_viewportRaf) return;
    _viewportRaf = requestAnimationFrame(() => {
        fitCanvasToCssSize();          // Canvas korrekt skalieren
        updateMobileControlsVisibility(); // du hast das bereits implementiert
        // checkOrientation();            // dein Overlay/Prüfung für Portrait vs. Landscape
        _viewportRaf = null;
    });
}


// function handleViewportChange() {
//     if (_viewportTimer) clearTimeout(_viewportTimer);
//     _viewportTimer = setTimeout(() => {
//         if (_viewportRaf) cancelAnimationFrame(_viewportRaf);
//         _viewportRaf = requestAnimationFrame(() => {
//             fitCanvasToCssSize();
//             updateMobileControlsVisibility();
//             // checkOrientation();   // bleibt auskommentiert, wie du wolltest
//             _viewportRaf = null;
//         });
//     }, 80); // 60–120ms funktioniert meist gut
// }


// === Deine bestehende Funktion wird auf die neue ausgelagert ===
function setupHiDPICanvas() {
    fitCanvasToCssSize(); // nur initial, alle Listener sind global
}


// window.addEventListener('resize', () => {
//     updateMobileControlsVisibility();
//     handleViewportChange();
// });


// window.addEventListener('orientationchange', () => {
//     handleViewportChange();
// });


window.addEventListener('load', () => {
    applyTranslations();
    handleViewportChange();

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
    // document.getElementById('langToggle').addEventListener('click', toggleLanguage);
    const musicIcon = document.getElementById('musicIcon');
    const soundIcon = document.getElementById('soundIcon');
    if (musicIcon) musicIcon.src = isMusicMuted ? 'img/mute.png' : 'img/speaker.png';
    if (soundIcon) soundIcon.src = isSoundMuted ? 'img/mute.png' : 'img/speaker.png';

    // Datei: game.js — im load-Handler ergänzen
    document.getElementById('langToggle')?.addEventListener('click', openLangModal);
    document.getElementById('langClose')?.addEventListener('click', closeLangModal);

    // Klick außerhalb der Karte schließt NUR Sprache; Ereignis stoppt hier.
    document.getElementById('langOverlay')?.addEventListener('click', (e) => {
        const card = document.querySelector('#langOverlay .modal-card');
        if (card && !card.contains(e.target)) closeLangModal();
        e.stopPropagation(); // ✅ verhindert, dass der globale Outside-Click ausgelöst wird
    });

    // Optionen (Delegation auf Container)
    document.querySelector('#langOverlay .modal-content')
        ?.addEventListener('click', (e) => {
            onLangOptionClick(e);
            e.stopPropagation(); // sicherheitshalber
        });


    document.getElementById('aboutGame')?.addEventListener('click', openStoryOverlay);
    document.getElementById('closeStory')?.addEventListener('click', closeStoryOverlay);
    document.getElementById('storyOverlay')?.addEventListener('click', (e) => {
        const card = document.querySelector('#storyOverlay .story-card'); // <— FIX
        if (card && !card.contains(e.target)) closeStoryOverlay();
        e.stopPropagation(); // <— verhindert Nebeneffekte
    });

});


window.addEventListener('resize', handleViewportChange, { passive: true });
window.addEventListener('orientationchange', handleViewportChange);
document.addEventListener('fullscreenchange', handleViewportChange);