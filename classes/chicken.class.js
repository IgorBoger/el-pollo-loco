class Chicken extends MovableObject {
    // x = 150 + Math.random() * 500;
    y = 360;
    height = 70;
    width = 60;
    // speed = 0.3;
    // speed = 0.15 + Math.random() * 0.2;
    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        // this.loadImage('img/3_enemies_chicken/chicken_normal/2_dead/dead.png'); // 🟢 DEAD-Bild vorladen
        this.loadImage('img/3_enemies_chicken/chicken_normal/2_dead/dead.png');
        this.deadImagePath = 'img/3_enemies_chicken/chicken_normal/2_dead/dead.png';


        this.x = 150 + Math.random() * 1200;
        this.speed = 0.15 + Math.random() * 0.2;
        // this.animate();

        // Wird nur für Colisionberechnung gezeichnet, danach muss weg!!!
        this.frameOffsetX = 3;
        this.frameWidth = this.width - 8;

        this.frameOffsetY = 6;
        this.frameHeight = this.height - 13;


        this.frameMs = 120;
        this.lastFrameTime = 0;
        this.isRemoved = false;
        this.mainInterval = null;
    }


    animate() {
        this.mainInterval = setInterval(() => {
            if (isGamePaused) return;
            const now = performance.now();
            this.updateChicken(now);
        }, 1000 / 60);
    }


    updateChicken(now) {
        if (this.isDead()) return this.handleDeath();
        this.moveLeft();
        this.updateWalkingFrames(now);
    }

    updateWalkingFrames(now) {
        if (!this.shouldAdvanceFrame(now)) return;
        this.playAnimation(this.IMAGES_WALKING);
        this.lastFrameTime = now;
    }

    shouldAdvanceFrame(now) {
        return (now - this.lastFrameTime) >= this.frameMs;
    }


    handleDeath() {
        if (this.isRemoved) return;
        this.isRemoved = true;
        this.loadImage(this.deadImagePath);
        this.stopChickenLoop();
        this.removeFromWorldDelayed();
    }


    stopChickenLoop() {
        if (this.mainInterval) clearInterval(this.mainInterval);
    }


    removeFromWorldDelayed() {
        setTimeout(() => {
            if (!this.world) return;
            this.world.level.enemies =
                this.world.level.enemies.filter(e => e !== this);
        }, 2000);
    }
}