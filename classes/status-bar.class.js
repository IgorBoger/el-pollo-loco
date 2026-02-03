class StatusBar extends DrawableObject {
    height = 50;
    width = 150;

    IMAGES_HEALTH = [
        'img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/orange/40.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/orange/60.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/orange/80.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/orange/100.png'
    ];

    IMAGES_COIN = [
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png'
    ];

    IMAGES_BOTTLE = [
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png'
    ];

    IMAGES_ENDBOSS = [
        'img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange100.png',
    ];
    percentage = 0;


    constructor(type = 'health') {
        super();
        this.applyTypeLayout(type);
        this.loadImages(this.IMAGES);
        this.initDefaultPercentage(type);
    }


    applyTypeLayout(type) {
        this.applyDefaultLayout(type);
        if (type === 'endboss') this.applyEndbossLayout();
    }


    applyDefaultLayout(type) {
        if (type === 'coin') return this.applyCoinLayout();
        if (type === 'bottle') return this.applyBottleLayout();
        return this.applyHealthLayout();
    }


    applyCoinLayout() {
        this.IMAGES = this.IMAGES_COIN;
        this.x = 20;
        this.y = 40;
    }


    applyBottleLayout() {
        this.IMAGES = this.IMAGES_BOTTLE;
        this.x = 20;
        this.y = 80;
    }


    applyHealthLayout() {
        this.IMAGES = this.IMAGES_HEALTH;
        this.x = 20;
        this.y = 0;
    }


    applyEndbossLayout() {
        this.IMAGES = this.IMAGES_ENDBOSS;
        this.x = 480;
        this.y = 5;
    }


    initDefaultPercentage(type) {
        const start = this.isFullStartType(type) ? 100 : 0;
        this.setPercentage(start);
    }


    isFullStartType(type) {
        return type === 'health' || type === 'endboss';
    }


    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }


    resolveImageIndex() {
        return this.getStatusIndex(this.percentage);
    }


    getStatusIndex(value) {
        if (value === 100) return 5;
        if (value > 80) return 4;
        if (value > 60) return 3;
        if (value > 40) return 2;
        if (value > 20) return 1;
        return 0;
    }
}