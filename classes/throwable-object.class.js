class ThrowableObject extends MovableObject {
    height = 70;
    width = 70;

    IMAGES_THROW = [ // 1) Als erstens die Pfade werden angelegt!
        '../img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        '../img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        '../img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        '../img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png',
    ]


    IMAGES_SPLASHES = [ // 1 und auch 5) Als erstens wieder die Pfade werden angelegt!
        '../img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        '../img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        '../img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        '../img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        '../img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        '../img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png',
    ]
    isSplashed = false;


    constructor(x, y, world, direction = 1) {
        super().loadImage(this.IMAGES_THROW[0]);
        this.loadImages(this.IMAGES_THROW); // 2) Die Pfade werden hochgeladen!
        this.loadImages(this.IMAGES_SPLASHES); // 2) Die Pfade werden hochgeladen!
        this.x = x;
        this.y = y;
        this.minY = 330; // 🟡 Bodenhöhe für Flasche (statt 180)
        this.world = world;

        this.direction = direction;
        this.otherDirection = direction === -1; // für Spiegelung beim Zeichnen

        this.throw();
        this.animate(); // 4) Die Animation wird aufgerufen, Flasche dreht sich!
    }


    throw() {
        this.world.playEffectSound(this.world.sounds.throw);
        console.log('bottle is throw ');
        this.speedY = 20;
        this.applyGravity();

        this.throwInterval = setInterval(() => {
            this.x += 15 * this.direction; // Flug nach rechts/links
        }, 25);
    }


    splash() {
        this.isSplashed = true;
        this.speedY = 0;
        this.speed = 0;

        setTimeout(() => {
            clearInterval(this.throwInterval);
            this.world.throwableObject = this.world.throwableObject.filter(obj => obj !== this);
        }, 300);
    }


    animate() {
        setInterval(() => {
            if (this.isSplashed) {
                this.playAnimation(this.IMAGES_SPLASHES); // 3) Die Pfade werden nacheinander animiert!
            } else {
                this.playAnimation(this.IMAGES_THROW);// 3) Die Pfade werden nacheinander animiert!
            }
        }, 1000 / 60); // Oder 20 FPS
    }
}