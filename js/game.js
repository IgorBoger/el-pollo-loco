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
// game.js – Top-Level
let reopenBurgerAfterOverlay = false;

const I18N = {
    DE: {
        orientationCard: "📱 Bitte drehen Sie Ihr Gerät ins Querformat (Landscape), um zu spielen.",

        // titleGame: "El Pollo Loco",
        titleGame: "Das verrückte Huhn",
        startGame: "Spiel starten",
        restartGame: "Spiel neu starten",
        // showControls: "Steuerung",

        aboutGame: "Über das Spiel",
        storyTitle: "Die Geschichte",
        storyP1: "In einem ruhigen Dorf lebten die Hühner friedlich … bis eines Tages das Chaos hereinbrach. Jetzt musst du Pepe helfen, Ordnung wiederherzustellen und gegen den verrückten Endboss zu bestehen!",
        storyLabelGoal: "Ziel:",
        storyTextGoal: "Besiege den Endboss & sammle Münzen.",
        storyLabelControls: "Steuerung:",
        storyTextControls: "Pfeile/WASD, D = Werfen, Space = Springen.",
        storyLabelTip: "Tipp:",
        storyTextTip: "Achte auf Boss-Animationen und Timing.",

        keyHelpButton: "Tastenbelegung",
        keyHelpTitle: "Tastenbelegung",
        keyHelpHeaderAction: "Aktion",
        keyHelpHeaderKey: "Taste",
        keyHelpHint: "Tipp: Drücke <strong>Esc</strong>, um zu schließen.",
        keyActionMoveLeft: "Links bewegen",
        keyActionMoveRight: "Rechts bewegen",
        keyActionJump: "Springen",
        keyActionThrow: "Werfen",
        keyKeyMoveLeft: "Pfeil links",
        keyKeyMoveRight: "Pfeil rechts",
        keyKeyJump: "Leertaste",
        keyKeyThrow: "D",

        rankingList: "Rangliste",
        labelMusic: "Musik",
        labelSound: "Ton",
        labelLanguage: "Sprache",
        settingsTitle: "Einstellungen",
        langName: "Deutsch",
        langModalTitle: "Sprache",
        // mobileJump: "Springen",
        // mobileThrow: "Werfen",
    },
    ES: {
        orientationCard: "📱 Gire su dispositivo al modo horizontal para jugar.",
        titleGame: "El Pollo Loco",
        startGame: "Iniciar juego",
        restartGame: "Reiniciar juego",
        // showControls: "Controles",

        aboutGame: "Acerca del juego",
        storyTitle: "La historia",
        storyP1: "En un pueblo tranquilo las gallinas vivían en paz… hasta que llegó el caos. ¡Ahora debes ayudar a Pepe a restablecer el orden y enfrentarte al jefe final!",
        storyLabelGoal: "Objetivo:",
        storyTextGoal: "Derrota al jefe final y recoge monedas.",
        storyLabelControls: "Controles:",
        storyTextControls: "Flechas/WASD, D = lanzar, Espacio = saltar.",
        storyLabelTip: "Consejo:",
        storyTextTip: "Fíjate en las animaciones del jefe y el timing.",

        keyHelpButton: "Asignación de teclas",
        keyHelpTitle: "Asignación de teclas",
        keyHelpHeaderAction: "Acción",
        keyHelpHeaderKey: "Tecla",
        keyHelpHint: "Consejo: Pulsa <strong>Esc</strong> para cerrar.",
        keyActionMoveLeft: "Mover a la izquierda",
        keyActionMoveRight: "Mover a la derecha",
        keyActionJump: "Saltar",
        keyActionThrow: "Lanzar",
        keyKeyMoveLeft: "Flecha izquierda",
        keyKeyMoveRight: "Flecha derecha",
        keyKeyJump: "Espacio",
        keyKeyThrow: "D",

        rankingList: "Clasificación",
        labelMusic: "Música",
        labelSound: "Sonido",
        labelLanguage: "Idioma",
        settingsTitle: "Ajustes",
        langName: "Español",
        langModalTitle: "Idioma",
        // mobileJump: "Saltar",
        // mobileThrow: "Tirar",
    },
    EN: {
        orientationCard: "📱 Please rotate your device to landscape mode to play.",

        // titleGame: "El Pollo Loco",
        titleGame: "The Crazy Chicken",
        startGame: "Start Game",
        restartGame: "Restart Game",
        // showControls: "Controls",

        aboutGame: "About",
        storyTitle: "The story",
        storyP1: "In a quiet village the chickens lived in peace… until chaos arrived. Now you must help Pepe restore order and face the crazy end boss!",
        storyLabelGoal: "Goal:",
        storyTextGoal: "Defeat the end boss & collect coins.",
        storyLabelControls: "Controls:",
        storyTextControls: "Arrows/WASD, D = throw, Space = jump.",
        storyLabelTip: "Tip:",
        storyTextTip: "Watch boss animations and timing.",

        keyHelpButton: "Key bindings",
        keyHelpTitle: "Key bindings",
        keyHelpHeaderAction: "Action",
        keyHelpHeaderKey: "Key",
        keyHelpHint: "Tip: Press <strong>Esc</strong> to close.",
        keyActionMoveLeft: "Move left",
        keyActionMoveRight: "Move right",
        keyActionJump: "Jump",
        keyActionThrow: "Throw",
        keyKeyMoveLeft: "Arrow Left",
        keyKeyMoveRight: "Arrow Right",
        keyKeyJump: "Space",
        keyKeyThrow: "D",

        rankingList: "Leaderboard",
        labelMusic: "Music",
        labelSound: "Sound",
        labelLanguage: "Language",
        settingsTitle: "Settings",
        langName: "English",
        langModalTitle: "Language",
        // mobileJump: "Jump",
        // mobileThrow: "Throw",
    }
};


function checkOrientation() {
    const warning = document.getElementById('orientationWarning');
    if (!warning) return;
    if (window.innerHeight > window.innerWidth) {
        warning.classList.remove('d-none');
        warning.classList.add('d-flex');
    } else {
        warning.classList.remove('d-flex');
        warning.classList.add('d-none');
    }
}


function applyTranslations() {
    document.documentElement.lang = currentLanguage.toLowerCase();
    const t = I18N[currentLanguage] || I18N.ES;
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('orientationCard', t.orientationCard);
    // Titel / Start / Menü
    set('titleGame', t.titleGame);
    set('startGame', t.startGame);
    set('restartGame', t.restartGame);
    // set('showControls', t.showControls);
    set('aboutGame', t.aboutGame);
    // set('storyTitle', t.storyTitle);
    /** STORY overlay **/
    set('storyTitle', t.storyTitle); // <h2 id="storyTitle"> … </h2> ist schon da
    // erster Absatz im Story-Overlay:
    const storyP = document.querySelector('#storyOverlay .story-content > p');
    if (storyP) storyP.textContent = t.storyP1;
    // 3 Listeneinträge neu zusammenbauen
    const lis = document.querySelectorAll('#storyOverlay .story-content ul li');
    if (lis[0]) lis[0].innerHTML = `<strong>${t.storyLabelGoal}</strong> ${t.storyTextGoal}`;
    if (lis[1]) lis[1].innerHTML = `<strong>${t.storyLabelControls}</strong> ${t.storyTextControls}`;
    if (lis[2]) lis[2].innerHTML = `<strong>${t.storyLabelTip}</strong> ${t.storyTextTip}`;

    set('keyHelpButton', t.keyHelpButton);
    /** KEY-HELP overlay **/
    set('keyHelpTitle', t.keyHelpTitle); // id existiert im H2
    // Key-Help statische Zellen
    set('keyActionMoveLeft', t.keyActionMoveLeft);
    set('keyKeyMoveLeft', t.keyKeyMoveLeft);
    set('keyActionMoveRight', t.keyActionMoveRight);
    set('keyKeyMoveRight', t.keyKeyMoveRight);
    set('keyActionJump', t.keyActionJump);
    set('keyKeyJump', t.keyKeyJump);
    set('keyActionThrow', t.keyActionThrow);
    set('keyKeyThrow', t.keyKeyThrow);
    // (falls IDs gesetzt)
    set('keyHelpHeaderAction', t.keyHelpHeaderAction);
    set('keyHelpHeaderKey', t.keyHelpHeaderKey);
    const hint = document.getElementById('keyHelpHint');
    if (hint) hint.innerHTML = t.keyHelpHint;

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
    // if (j) j.textContent = `⤴️ ${t.mobileJump}`;
    const th = document.getElementById('btnThrow');
    // if (th) th.textContent = `🧴 ${t.mobileThrow}`;
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

    // Game-Over Overlay zu
    document.getElementById('gameOverOverlay')?.classList.add('d-none');
    document.getElementById('gameOverOverlay')?.classList.remove('d-flex');

    // alte Welt sauber zerstören
    if (world && typeof world.destroy === "function") {
        world.destroy();
    }

    document.getElementById('startScreen').classList.remove('d-none');
}


function openStoryOverlay() {
    const overlay = document.getElementById('storyOverlay');
    if (!overlay) return;

    const burger = document.getElementById('burgerMenu');
    reopenBurgerAfterOverlay = burger?.classList.contains('open') || false;

    if (reopenBurgerAfterOverlay) {
        closeBurgerMenu(); // sanft nach rechts, wie gehabt
    }

    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');
}


function closeStoryOverlay() {
    const overlay = document.getElementById('storyOverlay');
    if (!overlay) return;

    if (reopenBurgerAfterOverlay) {
        toggleBurgerMenu(); // sanft nach links wieder auf
        reopenBurgerAfterOverlay = false;
    }

    overlay.classList.remove('d-flex');
    overlay.classList.add('d-none');
}


/* === KEY-HELP: öffnen/schließen === */
function openKeyHelpOverlay() {
    const overlay = document.getElementById('keyHelpOverlay');
    if (!overlay) return;

    const burger = document.getElementById('burgerMenu');
    reopenBurgerAfterOverlay = burger?.classList.contains('open') || false;

    if (reopenBurgerAfterOverlay) {
        closeBurgerMenu(); // sanft nach rechts, wie gehabt
    }

    // renderKeyHelpTable();
    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');   // zentriert dank Flex
}

function closeKeyHelpOverlay() {
    const overlay = document.getElementById('keyHelpOverlay');
    if (!overlay) return;

    if (reopenBurgerAfterOverlay) {
        toggleBurgerMenu(); // sanft nach links wieder auf
        reopenBurgerAfterOverlay = false;
    }

    overlay.classList.add('d-none');
    overlay.classList.remove('d-flex');
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


function openImpressumOverlay() {
    const overlay = document.getElementById('impressumOverlay');
    if (!overlay) return;

    const burger = document.getElementById('burgerMenu');
    window._reopenBurgerAfterImpressum = burger?.classList.contains('open') || false;

    if (window._reopenBurgerAfterImpressum) {
        closeBurgerMenu();
    }

    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');
}

function closeImpressumOverlay() {
    const overlay = document.getElementById('impressumOverlay');
    if (!overlay) return;

    if (window._reopenBurgerAfterImpressum) {
        toggleBurgerMenu();
        window._reopenBurgerAfterImpressum = false;
    }

    overlay.classList.remove('d-flex');
    overlay.classList.add('d-none');
}



// Datei: game.js — Funktion: outsideCloseHandler (NEU)
function outsideCloseHandler(e) {
    const burger = document.getElementById('burgerMenu');
    const settings = document.getElementById('settingsOverlay');
    const burgerBtn = document.getElementById('burgerBtn');
    const langOv = document.getElementById('langOverlay');
    const keyHelp = document.getElementById('keyHelpOverlay');
    const storyOv = document.getElementById('storyOverlay');
    const impressum = document.getElementById('impressumOverlay');

    // // ✅ Wenn Sprach-Overlay offen ist → NICHTS anderes schließen
    // if (langOv && !langOv.classList.contains('d-none')) return;

    // ✅ Wenn Sprach-ODER Tastenhilfe-Overlay offen ist → nichts anderes schließen
    // if ((langOv && !langOv.classList.contains('d-none')) ||
    //     (keyHelp && !keyHelp.classList.contains('d-none')) ||
    //     (storyOv && !storyOv.classList.contains('d-none'))) {
    //     return;
    // }

    if ((langOv && !langOv.classList.contains('d-none')) ||
        (keyHelp && !keyHelp.classList.contains('d-none')) ||
        (storyOv && !storyOv.classList.contains('d-none')) ||
        (impressum && !impressum.classList.contains('d-none'))) {
        return;
    }

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

    // if (e.key === 'Escape') closeKeyHelpOverlay();
    if (event.key === "Escape") {
        closeKeyHelpOverlay();
        closeStoryOverlay();
        closeLangModal(); // optional: Sprache auch schließen
        closeImpressumOverlay();
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


// Datei: js/game.js — NEU
function quickRestartGame() {
    // Startscreen bleibt versteckt:
    document.getElementById('startScreen')?.classList.add('d-none');

    // Endscreen-Overlay schließen (falls noch offen)
    document.getElementById('gameOverOverlay')?.classList.add('d-none');
    document.getElementById('gameOverOverlay')?.classList.remove('d-flex');

    // Alte Welt sauber zerstören
    if (world && typeof world.destroy === 'function') {
        world.destroy();
    }

    // Neu initialisieren (direkt ins Spiel)
    if (!canvas) {
        canvas = document.getElementById('canvas');
        setupHiDPICanvas();
    }
    world = new World(canvas, keyBaord);

    // Musik wie beim Start behandeln
    if (world?.sounds?.background) {
        const bg = world.sounds.background;
        bg.loop = true;
        bg.volume = 0.1;
        bg.muted = isMusicMuted;
        if (!isMusicMuted) {
            bg.play().catch(e => console.warn('Musikstart fehlgeschlagen:', e));
        }
    }

    handleViewportChange?.();
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


function handleViewportChange() {
    if (_viewportRaf) return;
    _viewportRaf = requestAnimationFrame(() => {
        fitCanvasToCssSize();
        updateMobileControlsVisibility();
        checkOrientation();
        _viewportRaf = null;
    });
}


function setupHiDPICanvas() {
    fitCanvasToCssSize();
}


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



    // 1) Menü-Button → click
    document.getElementById('keyHelpButton')?.addEventListener('click', openKeyHelpOverlay);

    // 2) Overlay-Schließen → click auf X
    document.getElementById('keyHelpClose')?.addEventListener('click', closeKeyHelpOverlay);

    // 3) Klick auf den dunklen Hintergrund schließt (und stoppt Bubbling,
    //    damit dein globaler outsideCloseHandler nicht zusätzlich feuert)
    document.getElementById('keyHelpOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeKeyHelpOverlay();
        e.stopPropagation();
    });


    document.getElementById('restartBtn')?.addEventListener('click', () => {
        quickRestartGame();
    });

    document.getElementById('homeBtn')?.addEventListener('click', () => {
        // Home = Startseite: deinen vorhandenen Weg nutzen
        // Schließt Overlay & zeigt Startscreen; Welt wird in restartGame() zerstört
        document.getElementById('gameOverOverlay')?.classList.add('d-none');
        document.getElementById('gameOverOverlay')?.classList.remove('d-flex');
        restartGame(); // existiert bereits und zeigt den Startscreen wieder an
    });


    // Impressum
    document.getElementById('impressumButton')?.addEventListener('click', openImpressumOverlay);
    document.getElementById('impressumClose')?.addEventListener('click', closeImpressumOverlay);

    document.getElementById('impressumOverlay')?.addEventListener('click', (e) => {
        const card = document.querySelector('#impressumOverlay .impressum-card');
        if (card && !card.contains(e.target)) {
            closeImpressumOverlay();
        }
        e.stopPropagation();
    });


});


window.addEventListener('resize', handleViewportChange, { passive: true });
window.addEventListener('orientationchange', handleViewportChange);
document.addEventListener('fullscreenchange', handleViewportChange);