class World {
    character = new Character();
    healthBar = new StatusBar('health');
    coinBar = new StatusBar('coin');
    bottleBar = new StatusBar('bottle');
    endbossBar = new StatusBar('endboss');
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

        // pepeSnoring: new Audio('../audio/pepe-snoring.mp3'),

        // endbossAppear: new Audio('../audio/endboss_appear.mp3'),
        // endbossDead: new Audio('../audio/endboss_dead.mp3')
    };
    coins = [];
    bottles = [];
    throwableObject = [];
    // ALT
    level = level1;
    backgroundTileCount = 1;
    canvas;
    ctx;
    keyBaord;
    camera_x = 0;
    lastBottleThrow = 0;

    lastDrawLogTime = 0;


    constructor(canvas, keyBaord) {
        this.level = this.cloneLevel(level1);
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyBaord = keyBaord;
        this.stopped = false;
        this.backgroundObjects = [];
        this.initBackground();
        setTimeout(() => this.draw(), 100);
        this.setWorld();
        this.updateBottleStatusBar();
        this.run();
        this.initCollectables(this.coins, Coin, 200, 50);
        this.initCollectables(this.bottles, Bottle, 100, 150);
        this.sounds.background.loop = true;
        this.sounds.background.volume = 0.1;
        this.sounds.background.muted = isMusicMuted;
        this.endscreen = new Endscreen(this.ctx, this.canvas);
    }


    cloneLevel(level) {
        const enemies = level.enemies.map(e => new e.constructor());
        const clouds = level.clouds.map(c => new c.constructor());

        const backgroundObjects = [];

        const layers = [...level.layers];
        const altLayers = [...level.altLayers];

        return new Level(enemies, clouds, backgroundObjects, layers, altLayers);
    }


    setWorld() {
        this.character.world = this;
        this.throwableObject.world = this;

        this.level.enemies.forEach(enemy => {
            enemy.world = this;
            enemy.animate?.();
        });
    }


    run() {
        this.runTimer = setInterval(() => {
            this.checkCollisions();
            this.checkThrowObject();
            this.checkBottleOnGround();
        }, 50);
    }


    checkCollisions() {
        this.collisionWithChicken();
        this.collisionWithCollectable(this.coins, 'coin', this.updateCoinStatusBar);
        this.collisionWithCollectable(this.bottles, 'bottle', this.updateBottleStatusBar);

        this.checkBottleHitsEnemies();
    }


    collisionWithChicken() {
        this.level.enemies.forEach((enemy) => {
            if (enemy.isDead() || this.character.isDead()) return;
            const now = new Date().getTime();
            if (!this.character.isColliding(enemy)) return;
            if (enemy instanceof Endboss && enemy.currentAnimation === 'attack') {
                const nowPerf = performance.now();
                const dir = (this.character.x < enemy.x) ? -1 : 1; 
                const knockY = 15;
                this.character.speedY = knockY;
                this.keepCharacterInsideBounds();
                if (!enemy.lastHitOnCharacter || now - enemy.lastHitOnCharacter > 600) {
                    this.character.hit(enemy);
                    enemy.lastHitOnCharacter = now;
                    this.updateHealthStatusBar();
                }
                enemy.currentSpeed = 0;
                enemy.targetSpeed = 0;
                enemy.recoverUntil = nowPerf + enemy.recoveryAfterAttackMs;
                enemy.postAlertCooldownUntil = enemy.recoverUntil;
                enemy.isChasing = false;
                enemy.chaseUntil = 0;
                enemy.setAnimation('walk');
                this.adjustEndbossAtLeftEdge(enemy);
                return;
            }

            if (
                this.character.isCollidingFromTop(enemy) &&
                (enemy instanceof Chicken || enemy instanceof SmallChicken)
            ) {
                enemy.energy = 0;
                enemy.hit();
                console.warn(`☠️ Gegner ${enemy.constructor.name} bei X=${enemy.x} wurde durch STOMP getötet`);
                return;
            }

            if (enemy instanceof Endboss) {
                const nowPerf = performance.now();
                if (nowPerf < (enemy.postAlertCooldownUntil || 0)) return; // kurze Body-Hit-Sperre nach Hurt/Stun
            }

            if (!enemy.lastHitOnCharacter || now - enemy.lastHitOnCharacter > 4000) {
                this.character.hit(enemy);
                enemy.lastHitOnCharacter = now;
                this.updateHealthStatusBar();
            }

        });
    }


    keepCharacterInsideBounds() {
        const c = this.character;
        if (!c) return;
        const minX = typeof c.minX === 'number' ? c.minX : -Infinity;
        const level = this.level;
        const maxX = level?.level_end_x ?? Infinity;
        if (c.x < minX) c.x = minX;
        if (c.x > maxX) c.x = maxX;
    }


    adjustEndbossAtLeftEdge(enemy) {
        const char = this.character;
        if (!char || !(enemy instanceof Endboss)) return;
        const minX = (typeof char.minX === 'number') ? char.minX : 0;
        const charAtEdge = char.x <= minX + 1;
        const charRight = char.x + (char.frameWidth || char.width);
        const gap = 30;
        const desiredBossX = charRight + gap;
        if (enemy.x < desiredBossX) enemy.x = desiredBossX;
    }


    collisionWithCollectable(array, propertyName, updateStatusBarCallback) {
        const index = array.findIndex(item => this.character.isColliding(item));
        if (index !== -1) {
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


    checkBottleHitsEnemies() {
        const now = new Date().getTime();

        this.level.enemies.forEach(enemy => {
            if (enemy.isDead()) return;

            this.throwableObject.forEach(bottle => {
                if (!bottle.isSplashed && bottle.isColliding(enemy)) {
                    if (enemy instanceof Endboss) {
                        const cd = 250;
                        enemy.stun(700);                       
                        if (!enemy.lastHit || now - enemy.lastHit > cd) {
                            enemy.hit();                        
                            enemy.lastHit = now;
                            this.updateEndbossStatusBar(enemy);
                        }
                        bottle.splash();                      
                    }
                }
            });
        });
    }


    playEffectSound(sound) {
        if (!sound) return;

        const isBackground = sound === this.sounds?.background;

        if (isBackground && isMusicMuted) return;
        if (!isBackground && isSoundMuted) return;

        try {
            sound.pause();
            sound.currentTime = 0;

            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.warn('Sound konnte nicht abgespielt werden:', error);
                });
            }
        } catch (e) {
            console.warn('Fehler beim Abspielen des Sounds:', e);
        }

        if (this.sounds.background) {
            this.sounds.background.volume = 0.1;
        }
    }



    initCollectables(array, ClassRef, offsetMinX = 200, offsetMaxX = 50) {
        const segments = 5;
        const segmentWidth = this.level.level_end_x / segments;
        for (let i = 0; i < segments; i++) {
            const minX = i * segmentWidth + offsetMinX;
            const maxX = (i + 1) * segmentWidth - offsetMaxX;
            const x = Math.random() * (maxX - minX) + minX;
            const y = Math.random() * 150 + 120;
            array.push(new ClassRef(x, y));
        }
    }


    checkThrowObject() {
        const now = Date.now();
        if (this.keyBaord.THROW && this.character.bottle > 0 && now - this.lastBottleThrow > 500) {
            const direction = this.character.otherDirection ? -1 : 1;
            const offsetX = direction * 30;
            let bottle;
            if (direction === -1) {
                bottle = new ThrowableObject(this.character.x + offsetX, this.character.y + 140, this, direction);
            } else {
                bottle = new ThrowableObject(this.character.x + 50, this.character.y + 140, this, direction);
            }
            this.throwableObject.push(bottle);
            this.character.bottle -= 5;
            if (this.character.bottle < 0) this.character.bottle = 0;
            this.updateBottleStatusBar();

            this.lastBottleThrow = now;
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


    updateEndbossStatusBar(endboss) {
        this.endbossBar.setPercentage(endboss.energy);
    }


    checkBottleOnGround() {
        this.throwableObject.forEach((bottle) => {
            if (!bottle.isSplashed && bottle.isOnGround()) {
                bottle.splash();
            }
        });
    }


    debugBackgrounds() {
        console.table(this.backgroundObjects);
    }


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
        if (this.stopped) return;
        const start = performance.now();
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

        const end = performance.now();
        const duration = end - start;
        // Nur alle 2 Sekunden loggen – wenn langsam
        const now = Date.now();
        if (duration > 30 && now - this.lastDrawLogTime > 2000) {
            console.warn(`⚠️ draw() dauerte ${Math.round(duration)} ms`);
            this.lastDrawLogTime = now;
        }

        if (this.character.isDead()) {
            if (!this.gameOverScheduled) {
                this.gameOverScheduled = true;
                const boss = this.level.enemies.find(e => e instanceof Endboss);
                const restBoss = (boss?.currentAnimation === 'attack')
                    ? Math.max(0, (boss.attackUntil || 0) - performance.now())
                    : 0;
                setTimeout(() => {
                    this.stopped = true;
                    this.endscreen.show();
                }, Math.min(1200, restBoss + 500)); 
            }
        }


        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }


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


    destroy() {
        this.stopped = true;
        if (this.runTimer) {
            clearInterval(this.runTimer);
            this.runTimer = null;
        }
        Object.values(this.sounds).forEach(s => {
            if (s instanceof Audio) {
                s.pause();
                s.currentTime = 0;
            }
        });
        this.endscreen?.hide();
        this.throwableObject = [];
        this.coins = [];
        this.bottles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}