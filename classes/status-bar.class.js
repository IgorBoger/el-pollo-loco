class StatusBar extends DrawableObject {
    height = 50;
    width = 150;

    IMAGES_HEALTH = [
        '../img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png',
        '../img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png',
        '../img/7_statusbars/1_statusbar/2_statusbar_health/orange/40.png',
        '../img/7_statusbars/1_statusbar/2_statusbar_health/orange/60.png',
        '../img/7_statusbars/1_statusbar/2_statusbar_health/orange/80.png',
        '../img/7_statusbars/1_statusbar/2_statusbar_health/orange/100.png'
    ];

    IMAGES_COIN = [
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png'
    ];

    IMAGES_BOTTLE = [
        '../img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png',
        '../img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
        '../img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png',
        '../img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png',
        '../img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png',
        '../img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png'
    ];

    IMAGES_ENDBOSS = [
        '../img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
        '../img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
        '../img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
        '../img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
        '../img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
        '../img/7_statusbars/2_statusbar_endboss/orange/orange100.png',
    ];
    percentage = 0;


    constructor(type = 'health') {
        super();
        if (type === 'coin') {
            this.IMAGES = this.IMAGES_COIN;
            this.x = 20;
            this.y = 40;
        } else if (type === 'bottle') {
            this.IMAGES = this.IMAGES_BOTTLE;
            this.x = 20;
            this.y = 80;
        } else {
            this.IMAGES = this.IMAGES_HEALTH;
            this.x = 20;
            this.y = 0;
        }
        if (type === 'endboss') {
            this.IMAGES = this.IMAGES_ENDBOSS;
            this.x = 480;
            this.y = 5;
        }

        this.loadImages(this.IMAGES);
        this.setPercentage(
            type === 'health' || type === 'endboss' ? 100 : 0
        );
    }

    setPercentage(percentage) {
        this.percentage = percentage; // => 0...5
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }


    resolveImageIndex() {
        if (this.percentage == 100) {
            return 5;
        } else if (this.percentage >= 80) {
            return 4;
        } else if (this.percentage >= 60) {
            return 3;
        } else if (this.percentage >= 40) {
            return 2;
        } else if (this.percentage >= 20) {
            return 1;
        } else {
            return 0;
        }
    }
}