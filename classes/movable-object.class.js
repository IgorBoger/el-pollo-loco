class MovableObject {
    x = 10;
    y = 50;
    height = 60;
    width = 100;
    img;


    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }


    moveLeft() {
        console.log('Moving left');
    }


    moveRight() {
        console.log('Moving right');
    }
}