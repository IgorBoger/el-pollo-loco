let canvas;
let world;
let keyBaord = new KeyBaord();
const buttons = [
    { id: 'btnLeft', key: 'LEFT' },
    { id: 'btnRight', key: 'RIGHT' },
    { id: 'btnJump', key: 'SPACE' },
    { id: 'btnThrow', key: 'THROW' }
];


function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyBaord);
    console.log('My Caracter is ', world);
    // console.log('My backGrounds are ');
    // console.table(world.level.backgroundObjects);
    // console.log(keyBaord);
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
    console.log('updateMobileControlsVisibility aufgerufen');
    const mobileControls = document.getElementById('mobileControls');
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 800;

    if (isMobile || isSmallScreen) {
        console.log('display ist unter 800px ODER mobil');

        mobileControls.classList.remove('d-none');
        mobileControls.classList.add('d-flex');
    } else {
        console.log('display ist größer als 800px UND nicht mobil');
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
            el.addEventListener(evt, () => keyBaord[btn.key] = true)
        );

        ['touchend', 'mouseup', 'mouseleave'].forEach(evt =>
            el.addEventListener(evt, () => keyBaord[btn.key] = false)
        );
    });
}



window.addEventListener('load', () => {
    updateMobileControlsVisibility();

    // buttons.forEach(btn => {
    //     const el = document.getElementById(btn.id);
    //     el.addEventListener('touchstart', () => keyBaord[btn.key] = true);
    //     el.addEventListener('touchend', () => keyBaord[btn.key] = false);
    // });

    addMobileButtonsFunction();
});


// window.addEventListener('load', updateMobileControlsVisibility, addMobileButtonsFunction);
window.addEventListener('resize', updateMobileControlsVisibility);