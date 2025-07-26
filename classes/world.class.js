class World {
    character = new Character();
    healthBar = new StatusBar('health');
    coinBar = new StatusBar('coin');
    bottleBar = new StatusBar('bottle');
    endbossBar = new StatusBar('endboss');
    coins = [];
    bottles = [];
    throwableObject = [];
    level = level1;
    backgroundTileCount = 1;
    canvas;
    ctx;
    keyBaord;
    camera_x = 0;
    sounds = {
        background: new Audio('../audio/background.mp3'),       //  Sound-OK
        walk: new Audio('../audio/walk.mp3'),                   //  Sound-OK
        jump: new Audio('../audio/jump.mp3'),                   //  Sound-OK
        hurt: new Audio('../audio/hurt.mp3'),                   //  Sound-OK
        dead: new Audio('../audio/dead.mp3'),                   //  Sound-OK
        coin: new Audio('../audio/coin.mp3'),                   //  Sound-OK
        bottle: new Audio('../audio/bottle.mp3'),               //  Sound-OK
        // hit: new Audio('../audio/hit.mp3'),                     //  Sound-OK
        throw: new Audio('../audio/bottle-throw.mp3'),          //  Sound-OK
        chicken: new Audio('../audio/chicken.mp3'),

        // endbossAppear: new Audio('../audio/endboss_appear.mp3'),
        // endbossDead: new Audio('../audio/endboss_dead.mp3')
    };


    constructor(canvas, keyBaord) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyBaord = keyBaord;
        this.backgroundObjects = [];
        this.initBackground();
        this.draw();
        this.setWorld();
        this.run();
        this.initCollectables(this.coins, Coin, 200, 50);
        this.initCollectables(this.bottles, Bottle, 100, 150);
        this.sounds.background.loop = true;
        this.sounds.background.volume = 0.1;
    }


    setWorld() {
        this.character.world = this;
        this.throwableObject.world = this;

        // NEU:
        this.level.enemies.forEach(enemy => {
            enemy.world = this;
        });
    }


    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObject();
        }, 200);
    }


    checkCollisions() {
        this.collisionWithChicken();
        this.collisionWithCollectable(this.coins, 'coin', this.updateCoinStatusBar);
        this.collisionWithCollectable(this.bottles, 'bottle', this.updateBottleStatusBar);

        this.collisionWithEndboss(); // NEU
    }


    collisionWithChicken() {
        this.level.enemies.forEach((enemy) => {
            let now = new Date().getTime();
            if (this.character.isColliding(enemy) && !this.character.isDead() && (!enemy.lastHit || now - enemy.lastHit > 4000)) { // 4 Sekunden Cooldown
                this.character.hit(enemy);
                enemy.lastHit = now;
                this.updateHealthStatusBar();
            }
        });

    }


    collisionWithCollectable(array, propertyName, updateStatusBarCallback) {
        const index = array.findIndex(item => this.character.isColliding(item));
        if (index !== -1) {
            // console.log(`propertyName ist aktuell: "${propertyName}"`);
            this.character[propertyName] += 20;
            if (this.character[propertyName] > 100) this.character[propertyName] = 100;
            updateStatusBarCallback.call(this);
            array.splice(index, 1);
            if (propertyName === 'coin') {
                this.playEffectSound(this.sounds.coin);
            }
            if (propertyName === 'bottle') {
                this.playEffectSound(this.sounds.bottle);
            }
        }
    }


    collisionWithEndboss() {
        const endboss = this.level.enemies.find(e => e instanceof Endboss);
        if (!endboss || endboss.isDead()) return;

        this.throwableObject.forEach((bottle, index) => {
            // console.log('Bottle X:', bottle.x, 'Y:', bottle.y, '| Endboss X:', endboss.x, 'Y:', endboss.y);
            // console.log('Kollision:', bottle.isColliding(endboss));

            if (bottle.isColliding(endboss)) {
                console.log('Endboss wurde getroffen!');

                endboss.hit();
                console.log('Endboss Energie nach Hit:', endboss.energy);
                this.endbossBar.setPercentage(endboss.energy);
                // this.updateEndbossStatusBar(endboss);
                this.throwableObject.splice(index, 1); // Flasche verschwindet nach Treffer
            }

            // if (endboss.isDead()) {
            //     console.log('Endboss ist besiegt!');
            //     this.level.enemies = this.level.enemies.filter(e => e !== endboss); // Entferne ihn
            //     // Hier kannst du z. B. ein Endbild zeigen:
            //     this.showWinScreen(); // ➕ Neue Methode definieren
            // }
        });
    }


    // updateEndbossStatusBar(endboss) {
    //     this.bottleBar.setPercentage(endboss.energy);
    // }



    playEffectSound(sound) {
        if (!sound) return;
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }


    initCollectables(array, ClassRef, offsetMinX = 200, offsetMaxX = 50) {
        const segments = 5;
        const segmentWidth = this.level.level_end_x / segments;
        for (let i = 0; i < segments; i++) {
            const minX = i * segmentWidth + offsetMinX;
            const maxX = (i + 1) * segmentWidth - offsetMaxX;
            const x = Math.random() * (maxX - minX) + minX;
            const y = Math.random() * 200 + 150;
            array.push(new ClassRef(x, y));
        }
    }


    checkThrowObject() {
        if (this.keyBaord.THROW && this.character.bottle > 0) {
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100, this);
            this.throwableObject.push(bottle);
            this.character.bottle -= 20;
            if (this.character.bottle < 0) {
                this.character.bottle = 0;
            }
            this.updateBottleStatusBar();
            // console.log(`Bottle thrown. Remaining: ${this.character.bottle}`);
        }
    }


    updateHealthStatusBar() {
        this.healthBar.setPercentage(this.character.energy);
    }


    updateCoinStatusBar() {
        this.coinBar.setPercentage(this.character.coin);
    }


    updateBottleStatusBar() {
        this.bottleBar.setPercentage(this.character.bottle);
    }


    // updateEndbossStatusBar() {
    //     this.bottleBar.setPercentage(this.character.bottle);
    // }


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
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addToMap(this.character);
        this.addObjectsToMap(this.coins);
        this.addObjectsToMap(this.bottles);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObject);
        if (this.character.x + this.canvas.width > this.backgroundTileCount * 720) {
            this.addBackgroundTile(this.backgroundTileCount);
            this.backgroundTileCount++;
        }
        this.ctx.translate(-this.camera_x, 0);
        // ::::::::::Zeigen nach dem "camera_x" Reset zeichnen/Oder "statusBar" x = -100; - geben,
        this.addToMap(this.healthBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.endbossBar);
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
            this.flipImageBack(mo);
        }
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