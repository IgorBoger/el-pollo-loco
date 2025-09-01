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


function toggleSettingsMenu() {
    const overlay = document.getElementById('settingsOverlay');

    const isOpen = overlay.classList.contains('open');

    if (isOpen) {
        overlay.classList.remove('open');
        setTimeout(() => overlay.classList.add('d-none'), 300);
    } else {
        overlay.classList.remove('d-none');
        setTimeout(() => overlay.classList.add('open'), 10);
    }
}


function toggleMusic() {
    isMusicMuted = !isMusicMuted;
    localStorage.setItem('isMusicMuted', isMusicMuted);
    document.getElementById('musicToggle').textContent = isMusicMuted ? '🔇' : '🔈';
    // if (world?.sounds?.background) world.sounds.background.muted = isMusicMuted;
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
    document.getElementById('soundToggle').textContent = isSoundMuted ? '🔇' : '🔈';
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


window.addEventListener('click', function (e) {
    const overlay = document.getElementById('settingsOverlay');
    const button = document.getElementById('settingsBtn');
    if (!overlay.contains(e.target) && e.target !== button) {
        overlay.classList.remove('open');
        setTimeout(() => overlay.classList.add('d-none'), 300);
    }
});


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

    // Einstellungen
    document.getElementById('settingsBtn').addEventListener('click', toggleSettingsMenu);
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);

    // Initialstatus setzen
    document.getElementById('musicToggle').textContent = isMusicMuted ? '🔇' : '🔈';
    document.getElementById('soundToggle').textContent = isSoundMuted ? '🔇' : '🔈';
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


// function setupHiDPICanvas() {
//     const canvas = document.getElementById('canvas');
//     const dpr = window.devicePixelRatio || 1;
//     const BASE_W = 720, BASE_H = 480;

//     // Logische Größe bleibt 720×480 (deine Game-Koordinaten)
//     canvas.style.width = '100%';
//     canvas.style.height = '100%';

//     // Physische Pixelzahl hochsetzen (schärfere Kanten/Fonts/Sprites)
//     canvas.width = BASE_W * dpr;
//     canvas.height = BASE_H * dpr;

//     // Renderkontext an DPI anpassen (keine Codeänderungen im Spiel nötig)
//     const ctx = canvas.getContext('2d');
//     ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
// }



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




// // === HiDPI & Vollbild-scharf: einmal aufrufen (z.B. am Ende von init()) ===
// function setupHiDPICanvas() {
//     const c = document.getElementById('canvas');
//     const ctx = c.getContext('2d');

//     function fit() {
//         const dpr = Math.max(1, window.devicePixelRatio || 1);
//         // CSS-Größe (vom Layout) auslesen – NICHT per JS setzen
//         const cssW = Math.round(c.clientWidth);
//         const cssH = Math.round(c.clientHeight);

//         // Zeichenpuffer nur anpassen, wenn nötig (spart Arbeit)
//         const need = c.width !== cssW * dpr || c.height !== cssH * dpr;
//         if (need) {
//             c.width = cssW * dpr;   // physische Pixel
//             c.height = cssH * dpr;
//             ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Koordinaten bleiben „wie vorher“
//             ctx.imageSmoothingEnabled = true;       // glatt statt pixelig
//         }
//     }

//     // Auf Vollbild-/Resize-Änderungen reagieren (klein & robust)
//     window.addEventListener('resize', fit);
//     window.addEventListener('orientationchange', fit);
//     document.addEventListener('fullscreenchange', fit);

//     fit(); // initial
// }
// // >>> In deiner init(): nach dem Holen des Canvas EINMAL aufrufen:
// // const canvas = document.getElementById('canvas');
// // setupHiDPICanvas();
