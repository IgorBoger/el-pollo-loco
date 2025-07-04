class Cloud extends MovableObject {
    // x = Math.random() * 500;
    y = 50;
    height = 300;
    width = 460;  


    constructor() {
        super().loadImage('../img/5_background/layers/4_clouds/1.png');

        this.x = Math.random() * 500;
        // this.height = 80;
        // this.width = 200;
        // this.y = 0;
        this.animate();
    }


    animate() {
        this.moveLeft();
        // console.log('cloud speed to lef is: ' + this.speed);
    }
}