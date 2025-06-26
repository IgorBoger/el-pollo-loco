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
        setInterval( () => {
            this.x -= 0.1;
            // console.log(this.x);
        }, 1000 / 60);
    }
}