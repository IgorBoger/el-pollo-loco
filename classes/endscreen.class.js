class Endscreen extends OverlayScreen {

    endScreenConfig = {
        overlayId: 'gameOverOverlay',
        imageSrc: 'img/9_intro_outro_screens/game_over/game over.png',
        overlayAlpha: 0,
        overlayColor: 'transparent',
        imageAlpha: 1,
        fadeSpeed: 0.06
    };

    constructor(ctx, canvas) {
        super(ctx, canvas);
        this.init(this.endScreenConfig);
        this.fadeSpeed = 0.06;
    }


    show() {
        this.captureBaseFrame();
        super.show();
    }


    draw() {
        this.drawWithBaseFrame();
    }
}
