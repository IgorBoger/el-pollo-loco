let canvas;
let world;
let keyBaord = new KeyBaord();


function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyBaord);
    // console.log('My Caracter is ', world);
    console.log('My backGrounds are ');
    console.table(world.level.backgroundObjects);
}


document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft") { // Left arrow
        keyBaord.LEFT = false;
    }
    if (event.key === "ArrowRight") { // Right arrow
        keyBaord.RIGHT = false;
    }
    if (event.key === " ") { // Right arrow
        console.log('Space');
        keyBaord.SPACE = false;
        console.log('Space is :' + keyBaord.SPACE);
        console.log(keyBaord);
    }
    if (event.key === "ArrowUp") { // Right arrow
        console.log('up');
        // character.moveRight();
        keyBaord.UP = false;
        console.log('up is :' + keyBaord.UP);
        console.log(keyBaord);
    }
    if (event.key === "ArrowDown") { // Right arrow
        console.log('down');
        // character.moveRight();
        keyBaord.DOWN = false;
        console.log('up is :' + keyBaord.DOWN);
        console.log(keyBaord);
    }
});


document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") { // Left arrow
        keyBaord.LEFT = true;
    }
    if (event.key === "ArrowRight") { // Right arrow
        keyBaord.RIGHT = true;
    }
    if (event.key === " ") { // Right arrow
        console.log('Space');
        // character.moveRight();
        keyBaord.SPACE = true;
        console.log('Space is :' + keyBaord.SPACE);
        console.log(keyBaord);
    }
    if (event.key === "ArrowUp") { // Right arrow
        console.log('up');
        // character.moveRight();
        keyBaord.UP = true;
        console.log('up is :' + keyBaord.UP);
        console.log(keyBaord);
    }
    if (event.key === "ArrowDown") { // Right arrow
        console.log('down');
        // character.moveRight();
        keyBaord.DOWN = true;
        console.log('up is :' + keyBaord.DOWN);
        console.log(keyBaord);
    }
});