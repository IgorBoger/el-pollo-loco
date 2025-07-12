let canvas;
let world;
let keyBaord = new KeyBaord();


function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyBaord);
    console.log('My Caracter is ', world);
    // console.log('My backGrounds are ');
    // console.table(world.level.backgroundObjects);
    console.log(keyBaord);

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
        // character.moveRight();
        keyBaord.UP = false;
        console.log('up is :' + keyBaord.UP);
        console.log(keyBaord);
    }
    if (event.key === "ArrowDown") {
        console.log('down');
        // character.moveRight();
        keyBaord.DOWN = false;
        console.log('down is :' + keyBaord.DOWN);
        console.log(keyBaord);
    }
    if (event.key === "d") {
        console.log('throw');
        // character.moveRight();
        keyBaord.THROW = false;
        console.log('throw is :' + keyBaord.THROW);
        console.log(keyBaord);
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
        // character.moveRight();
        keyBaord.UP = true;
        console.log('up is :' + keyBaord.UP);
        console.log(keyBaord);
    }
    if (event.key === "ArrowDown") {
        console.log('down');
        // character.moveRight();
        keyBaord.DOWN = true;
        console.log('up is :' + keyBaord.DOWN);
        console.log(keyBaord);
    }
    if (event.key === "d") {
        console.log('throw');
        // character.moveRight();
        keyBaord.THROW = true;
        console.log('throw is :' + keyBaord.THROW);
        console.log(keyBaord);
    }
});