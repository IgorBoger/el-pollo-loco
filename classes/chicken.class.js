class Chicken extends MovableObject {
    x = 150 + Math.random() * 500;
    y = 350;
    height = 70;
    width = 60;


    constructor() {
        super().loadImage('../img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        // this.x = 150 + Math.random() * 500;
        this.animate();
    }


        animate() {
        setInterval( () => {
            this.x -= 0.3;
            // console.log(this.x);
        }, 1000 / 60);
    }
}