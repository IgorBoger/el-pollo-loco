class Chicken extends MovableObject {
    x = 150 + Math.random() * 500;
    y = 350;
    height = 70;
    width = 60;
    CHICKEN_IMAGES_WALKING = [
        '../img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        '../img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        '../img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];


    constructor() {
        super().loadImage('../img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        // this.x = 150 + Math.random() * 500;
        this.loadImages(this.CHICKEN_IMAGES_WALKING);

        this.animate();
    }


    animate() {
        setInterval(() => {
            this.x -= 0.3;
            // console.log(this.x);
        }, 1000 / 60);

        setInterval(() => {
            let i = this.currentImage % this.CHICKEN_IMAGES_WALKING.length; // let i = 7 % 6; => 1; Rest 1
            // i = 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5,
            // let path = this.CHICKEN_IMAGES_WALKING[this.currentImage];
            let path = this.CHICKEN_IMAGES_WALKING[i];
            this.img = this.imageCache[path];
            console.log('mudulo is ' + i);
            console.log('currentImage ' + this.currentImage);
            this.currentImage++;

            // if (this.currentImage === 5) {
            //     console.log(this.currentImage);
            //     this.currentImage = 0;
            // }
        }, 100);
    }
}