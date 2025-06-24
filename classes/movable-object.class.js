class MovableObject {
    x;
    y;
    height;
    width;
    img;


    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }


    moveLeft() {
        // this.x -= 10;
        console.log('Moving left to', this.x);
    }


    moveRight() {
        // this.x += 10;
        console.log('Moving right to', this.x);
    }
}