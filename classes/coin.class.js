class Coin {
    x = 20;
    y = 20;
    height = 8;
    width = 200;

    IMAGES_COIN_STATUS = [
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
        '../img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png',
    ];


    constructor(parameters) {
        super().loadImage(this.IMAGES_COIN_STATUS[0]); // Startet mit dem ersten Bild aus dem Array!!!
        this.loadImages(this.IMAGES_COIN_STATUS);
    }
}