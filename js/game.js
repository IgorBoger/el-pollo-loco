let canvas;
let world;


function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas);
    console.log('My Caracter is ', world);
}


// const character = new Character();

// document.addEventListener("keydown", function(event) {
//     if (event.key === 37) { // Left arrow
//         console.log('left');
//         character.moveLeft();
//     } else if (event.key === 39) { // Right arrow
//         console.log('right');
//         character.moveRight();
//     }
// });