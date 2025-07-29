class SmallChicken extends MovableObject {
    // x = 150 + Math.random() * 500;
    y = 380;
    height = 50;
    width = 50;
    // speed = 0.3;
    // speed = 0.15 + Math.random() * 0.2;
    IMAGES_WALKING = [
        '../img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        '../img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        '../img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        // this.loadImage('../img/3_enemies_chicken/chicken_small/2_dead/dead.png'); // 🟢 DEAD-Bild vorladen
        this.loadImage('../img/3_enemies_chicken/chicken_small/2_dead/dead.png');
        this.deadImagePath = '../img/3_enemies_chicken/chicken_small/2_dead/dead.png';


        this.x = 150 + Math.random() * 1000;
        this.speed = 0.15 + Math.random() * 0.2;
        // this.animate();

        // Wird nur für Colisionberechnung gezeichnet, danach muss weg!!!
        this.frameOffsetX = 3;
        this.frameWidth = this.width - 8;

        this.frameOffsetY = 6;
        this.frameHeight = this.height - 13;
    }


    animate() {
        this.walkInterval = setInterval(() => {
            if (!this.isDead()) {
                // this.moveLeft();
            }
        }, 1000 / 60);

        this.animationInterval = setInterval(() => {
            if (this.isDead()) {
                this.loadImage(this.deadImagePath); // 🔥 direkt neu laden
                clearInterval(this.animationInterval);
                clearInterval(this.walkInterval);

                setTimeout(() => {
                    if (this.world) {
                        this.world.level.enemies = this.world.level.enemies.filter(e => e !== this);
                    }
                }, 2000);
            } else {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }


}