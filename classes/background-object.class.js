class BackgroundObject extends MovableObject {
    x = 0;
    y = 0;
    height = 480;
    width = 720;


    constructor(imagePath) {
        super().loadImage(imagePath);
    }
}