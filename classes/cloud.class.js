class Cloud extends MovableObject {
    x = Math.random() * 150;
    y = 50;
    height = 300;
    width = 460;


    constructor() {
        super().loadImage('../img/5_background/layers/4_clouds/1.png');

        // this.x = Math.random() * 150;
        // this.height = 80;
        // this.width = 200;
        // this.y = 0;
    }
}