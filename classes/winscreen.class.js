class Winscreen extends OverlayScreen {

    winScreenConfig = {
        overlayId: 'winOverlay',
        imageSrc: 'img/You won, you lost/You Win A.png',
        overlayAlpha: 0,
        overlayColor: 'transparent',
        imageAlpha: 1,
        fadeSpeed: 0.06
    };

    constructor(ctx, canvas) {
        super(ctx, canvas);
        this.init(this.winScreenConfig);
    }

    show() {
        this.captureBaseFrame();
        super.show();
    }


    draw() {
        this.drawWithBaseFrame();
    }
}
