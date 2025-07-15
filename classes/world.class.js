class World {
    character = new Character();
    healthBar = new StatusBar('health');
    coinBar = new StatusBar('coin');
    bottleBar = new StatusBar('bottle');
    // coin = new Coin();
    coins = [
        // new Coin(150, 150),
        // new Coin(600, 200)
    ];
    throwableObject = [];
    level = level1;
    // enemies = level1.enemies;
    // clouds = level1.clouds;
    // layers = level1.layers;
    // altLayers = level1.altLayers;
    // level_end_x = level1.level_end_x;
    backgroundTileCount = 1; // var -2
    canvas;
    ctx;
    keyBaord;
    camera_x = 0;
    // statusBar = new StatusBar();


    constructor(canvas, keyBaord) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyBaord = keyBaord;
        this.backgroundObjects = []; // Hier richtig initialisieren
        this.initBackground();
        this.draw();
        this.setWorld();
        this.run();
        this.initCoins();
    }


    setWorld() {
        this.character.world = this;
        // this.bottle.world = this;
        this.throwableObject.world = this;
    }


    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObject();
        }, 200);
        // this.checkThrowObject();
    }


    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (this.character.isColliding(enemy)) {
                // console.log('Collision with Character', enemy);
                this.character.hit(enemy);
                this.updateHealthStatusBar();
            }
        });


        const coinIndex = this.coins.findIndex(coin => this.character.isColliding(coin));
        if (coinIndex !== -1) {
            const coin = this.coins[coinIndex];
            this.character.coin += 20;
            if (this.character.coin > 100) this.character.coin = 100;
            if (this.character.coin >= 100) {
            }
            this.updateCoinStatusBar();
            this.coins.splice(coinIndex, 1);
        }
    }


    initCoins() {
        const segments = 5;
        const segmentWidth = this.level.level_end_x / segments;
        for (let i = 0; i < segments; i++) {
            const minX = i * segmentWidth + 200;
            const maxX = (i + 1) * segmentWidth - 50;
            const x = Math.random() * (maxX - minX) + minX;
            const y = Math.random() * 200 + 150;
            this.coins.push(new Coin(x, y));
        }
    }




    checkThrowObject() {
        if (this.keyBaord.THROW) {
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100)
            this.throwableObject.push(bottle);
        }
    }


    updateHealthStatusBar() {
        this.healthBar.setPercentage(this.character.energy);
    }


    updateCoinStatusBar() {
        this.coinBar.setPercentage(this.character.coin);
    }


    debugBackgrounds() {
        console.table(this.backgroundObjects);
    }


    /**
    * Initialisiert die Hintergrund-Objekte für den Parallax-Effekt.
    */
    initBackground() {
        for (let i = -1; i < this.backgroundTileCount; i++) { // var -2
            const xPos = i * 720;
            const currentLayers = i % 2 === 0 ? this.level.layers : this.level.altLayers; // ersetz die if - else abfrage
            this.addTile(xPos, currentLayers);
        }
    }


    addTile(xPos, layers) {
        layers.forEach(imagePath => {
            this.level.backgroundObjects.push(new BackgroundObject(imagePath, xPos));
        });
    }


    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        // this.ctx.translate(Math.round(this.camera_x), 0);

        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        // this.addToMap(this.statusBar);
        this.addToMap(this.character);

        // this.addToMap(this.coin);
        // this.addObjectsToMap(this.coins);
        this.addObjectsToMap(this.coins.filter(c => !c.collected));


        // this.addToMap(this.bottle);
        // this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObject);
        // this.addObjectsToMap(this.coin);


        if (this.character.x + this.canvas.width > this.backgroundTileCount * 720) {
            this.addBackgroundTile(this.backgroundTileCount);
            this.backgroundTileCount++;
        }

        this.ctx.translate(-this.camera_x, 0);
        // this.ctx.translate(Math.round(-this.camera_x), 0);

        // ::::::::::Zeigen nach dem "camera_x" Reset zeichnen/Oder "statusBar" x = -100; - geben,
        // this.updateHealthStatusBar();
        // this.addToMap(this.statusBar);
        this.addToMap(this.healthBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);



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
        const currentLayers = tileIndex % 2 === 0 ? this.level.layers : this.level.altLayers;

        this.addTile(xPos, currentLayers);
    }


    addObjectsToMap(objects) {
        objects.forEach(obj => {
            this.addToMap(obj);
        });
    }


    addToMap(mo) {
        this.ctx.save();
        if (mo.otherDirection) {
            this.flipImage(mo);
        } else {
            // this.ctx.translate(mo.x, mo.y);
            this.flipImageBack(mo);
        }
        // this.ctx.drawImage(mo.img, 0, 0, mo.width, mo.height);
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        this.ctx.restore();
    }

    flipImage(mo) {
        this.ctx.translate(mo.x + mo.width, mo.y);
        this.ctx.scale(-1, 1);
    }


    flipImageBack(mo) {
        this.ctx.translate(mo.x, mo.y);
    }
}