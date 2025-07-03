let canvas;
let world;
let keyBaord = new KeyBaord();


function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyBaord);
    console.log('My Caracter is ', world);
}


// const character = new Character();
// console.log(keyBaord);
// console.log(LEFT, RIGHT, UP, SPACE, DOWN);


document.addEventListener("keyup", function (event) {
    // console.log(event);

    if (event.key === "ArrowLeft") { // Left arrow
        console.log('left');
        keyBaord.LEFT = false;
        console.log('left is :' + keyBaord.LEFT);
        console.log(keyBaord);
        // console.log(event.key);
        // character.moveLeft();
    }
    if (event.key === "ArrowRight") { // Right arrow
        console.log('right');
        // character.moveRight();
        keyBaord.RIGHT = false;
        console.log('right is :' + keyBaord.RIGHT);
        console.log(keyBaord);
    }
    // console.log(event.key);
    if (event.key === " ") { // Right arrow
        console.log('Space');
        // character.moveRight();
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
    // console.log(event);

    if (event.key === "ArrowLeft") { // Left arrow
        console.log('left');
        keyBaord.LEFT = true;
        console.log('left is :' + keyBaord.LEFT);
        console.log(keyBaord);
        // console.log(event.key);
        // character.moveLeft();
    }
    if (event.key === "ArrowRight") { // Right arrow
        console.log('right');
        // character.moveRight();
        keyBaord.RIGHT = true;
        console.log('right is :' + keyBaord.RIGHT);
        console.log(keyBaord);
    }
    // console.log(event.key);
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