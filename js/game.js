let canvas;
let world;
let keyBaord = new KeyBaord();
const buttons = [
    { id: 'btnLeft', key: 'LEFT' },
    { id: 'btnRight', key: 'RIGHT' },
    { id: 'btnJump', key: 'SPACE' },
    { id: 'btnThrow', key: 'THROW' }
];
// let isMuted = false;
let isMuted = localStorage.getItem('isMuted') === 'true';



function init() {
    canvas = document.getElementById('canvas');
    setupHiDPICanvas();      // <- hier einmalig aufrufen, fertig
    world = new World(canvas, keyBaord);
    console.log('My Caracter is ', world);
    // console.log('My backGrounds are ');
    // console.table(world.level.backgroundObjects);
    // console.log(keyBaord);

    // Wende den Mute-Zustand auf alle Sounds an
    Object.values(world.sounds).forEach(sound => {
        if (sound instanceof Audio) {
            sound.muted = isMuted;
        }
    });
    updateMuteIcon(); // Symbol korrekt beim Start
}


function startGame() {
    console.log('gecklickt');
    document.getElementById('startScreen').classList.add('d-none');
    init();

    if (world?.sounds?.background) {
        // console.log('background-sound is activated');
        world.playEffectSound(world.sounds.background);
        // world.sounds.background.play();
    }
}


function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('isMuted', isMuted);
    updateMuteIcon();

    if (!world || !world.sounds) return;

    Object.values(world.sounds).forEach(sound => {
        if (sound instanceof Audio) {
            sound.muted = isMuted;
        }
    });
}


function updateMuteIcon() {
    const btn = document.getElementById('muteButton');
    btn.textContent = isMuted ? '🔇' : '🔈';
}


// window.addEventListener('load', () => {
//     document.getElementById('muteButton').addEventListener('click', toggleMute);
// });



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
    const muteBtn = document.getElementById('muteButton');
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }
    updateMuteIcon(); // damit Symbol beim Start stimmt
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
