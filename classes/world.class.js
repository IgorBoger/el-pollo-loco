class World {
    character = new Character();
    enemies = [
        new Chicken(),
        new Chicken(),
        new Chicken()
    ];
    clouds = [
        new Cloud()
    ];
    backgroundObjects = [];
    layers = [
        '../img/5_background/layers/air.png',
        '../img/5_background/layers/3_third_layer/1.png',
        '../img/5_background/layers/2_second_layer/1.png',
        '../img/5_background/layers/1_first_layer/1.png'
    ];

    altLayers = [
        '../img/5_background/layers/air.png',
        '../img/5_background/layers/3_third_layer/2.png',
        '../img/5_background/layers/2_second_layer/2.png',
        '../img/5_background/layers/1_first_layer/2.png'
    ];
    backgroundTileCount = 1;
    // backgroundObjects = [

    //     new BackgroundObject('../img/5_background/layers/air.png', -720),
    //     new BackgroundObject('../img/5_background/layers/3_third_layer/2.png', -720),
    //     new BackgroundObject('../img/5_background/layers/2_second_layer/2.png', -720),
    //     new BackgroundObject('../img/5_background/layers/1_first_layer/2.png', -720),

    //     new BackgroundObject('../img/5_background/layers/air.png', 0),
    //     new BackgroundObject('../img/5_background/layers/3_third_layer/1.png', 0),
    //     new BackgroundObject('../img/5_background/layers/2_second_layer/1.png', 0),
    //     new BackgroundObject('../img/5_background/layers/1_first_layer/1.png', 0),
    //     new BackgroundObject('../img/5_background/layers/air.png', 720),
    //     new BackgroundObject('../img/5_background/layers/3_third_layer/2.png', 720),
    //     new BackgroundObject('../img/5_background/layers/2_second_layer/2.png', 720),
    //     new BackgroundObject('../img/5_background/layers/1_first_layer/2.png', 720),

    //     new BackgroundObject('../img/5_background/layers/air.png', 720*2),
    //     new BackgroundObject('../img/5_background/layers/3_third_layer/1.png', 720*2),
    //     new BackgroundObject('../img/5_background/layers/2_second_layer/1.png', 720*2),
    //     new BackgroundObject('../img/5_background/layers/1_first_layer/1.png', 720*2),
    //     new BackgroundObject('../img/5_background/layers/air.png', 720*3),
    //     new BackgroundObject('../img/5_background/layers/3_third_layer/2.png', 720*3),
    //     new BackgroundObject('../img/5_background/layers/2_second_layer/2.png', 720*3),
    //     new BackgroundObject('../img/5_background/layers/1_first_layer/2.png', 720*3)
    // ];
    canvas;
    ctx;
    keyBaord;
    camera_x = 0;


    constructor(canvas, keyBaord) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyBaord = keyBaord;
        this.initBackground();
        this.draw();
        this.setWorld();
    }


    /**
 * Initialisiert die Hintergrund-Objekte für den Parallax-Effekt.
 */
    initBackground() {
        for (let i = -1; i <= this.backgroundTileCount; i++) {
            const xPos = i * 720;
            const currentLayers = i % 2 === 0 ? this.layers : this.altLayers; // ersetz die if - else abfrage
            // let currentLayers;
            // if (i % 2 === 0) {
            //     currentLayers = this.layers;
            // } else {
            //     currentLayers = this.altLayers;
            // }

            currentLayers.forEach(imagePath => {
                this.backgroundObjects.push(new BackgroundObject(imagePath, xPos));
            });
        }
    }


    setWorld() {
        this.character.world = this;
    }


    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        // this.ctx.translate(Math.round(this.camera_x), 0);


        this.addObjectsToMap(this.backgroundObjects);
        this.addToMap(this.character);
        this.addObjectsToMap(this.enemies);
        this.addObjectsToMap(this.clouds);

        if (this.character.x > (this.backgroundTileCount - 2) * 720) {
            this.addBackgroundTile(this.backgroundTileCount);
            this.backgroundTileCount++;
        }

        this.ctx.translate(-this.camera_x, 0);
        // this.ctx.translate(Math.round(-this.camera_x), 0);
        

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }


    /**
 * Fügt eine neue Hintergrund-Kachel an der gegebenen Position hinzu.
 * @param {number} tileIndex - Der Index der neuen Kachel
 */
    addBackgroundTile(tileIndex) {
        const xPos = tileIndex * 720;
        const currentLayers = tileIndex % 2 === 0 ? this.layers : this.altLayers;

        currentLayers.forEach(imagePath => {
            this.backgroundObjects.push(new BackgroundObject(imagePath, xPos));
        });
    }



    addObjectsToMap(objects) {
        objects.forEach(obj => {
            this.addToMap(obj);
        });
    }


    // addToMap(mo) {
    //     if (mo.otherDirection) {
    //         this.ctx.save();
    //         this.ctx.translate(mo.width, 0);
    //         this.ctx.scale(-1, 1);
    //         mo.x = mo.x * -1;
    //     }
    //     this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);// oder kurz "mo.img" usw.!!
    //     if (mo.otherDirection) {
    //         mo.x = mo.x * -1;
    //         this.ctx.restore();
    //     }        
    // }


    addToMap(mo) {
        this.ctx.save();
        if (mo.otherDirection) {
            this.ctx.translate(mo.x + mo.width, mo.y);
            this.ctx.scale(-1, 1);
        } else {
            this.ctx.translate(mo.x, mo.y);
        }
        // this.ctx.drawImage(mo.img, 0, 0, mo.width, mo.height);
        this.ctx.drawImage(mo.img, Math.round(0), Math.round(0), mo.width, mo.height);

        this.ctx.restore();
    }



}


