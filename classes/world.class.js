class World {
    character = new Character();
    healthBar = new StatusBar('health');
    coinBar = new StatusBar('coin');
    bottleBar = new StatusBar('bottle');
    endbossBar = new StatusBar('endboss');
    sounds = {
        background: new Audio('audio/background.mp3'),                  //  Sound-OK
        pepeWalk: new Audio('audio/pepe_walk.mp3'),                   //  Sound-OK
        pepeJump: new Audio('audio/pepe_jump.mp3'),                   //  Sound-OK
        pepeHurt: new Audio('audio/pepe_hurt.mp3'),                   //  Sound-OK
        pepeDead: new Audio('audio/pepe_dead.mp3'),                   //  Sound-OK
        pepeSnoring: new Audio('audio/pepe_snoring.mp3'),               //  Sound-
        pepeCalmBreathing: new Audio('audio/pepe_calm_breathing.mp3'),  //  Sound-OK

        collectedCoin: new Audio('audio/collected_coin.mp3'),                   //  Sound-OK
        collectedBottle: new Audio('audio/collected_bottle.mp3'),               //  Sound-OK
        // hit: new Audio('audio/hit.mp3'),                     //  Sound-OK

        thrownBottle: new Audio('audio/thrown_bottle.mp3'),     //  Sound-OK
        chickenDead: new Audio('audio/chicken_dead.mp3'),       //  Sound-OK

        endbossAppear: new Audio('audio/endboss_appear.mp3'),   //  Sound-OK
        endbossAlert: new Audio('audio/endboss_alert.mp3'),
        endbossAttack: new Audio('audio/endboss_attack.mp3'),
        endbossHurt: new Audio('audio/endboss_hurt.mp3'),
        endbossDead: new Audio('audio/endboss_dead.mp3')
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
        this.bgBaseVolume = 0.1;
        this.applyBackgroundBaseVolume();
        this.endscreen = new Endscreen(this.ctx, this.canvas);
        this.winscreen = new Winscreen(this.ctx, this.canvas);
        this.winScheduled = false;

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
            if (isGamePaused || this.stopped) return;
            this.checkCollisions();
            this.checkThrowObject();
            this.checkBottleOnGround();
        }, 1000 / 60);
    }


    checkCollisions() {
        this.collisionWithChicken();
        this.collisionWithCollectable(this.coins, 'coin', this.updateCoinStatusBar);
        this.collisionWithCollectable(this.bottles, 'bottle', this.updateBottleStatusBar);

        this.checkBottleHitsEnemies();
    }


    collisionWithChicken() {
        this.level.enemies.forEach(enemy => this.handleEnemyCollision(enemy));
    }


    handleEnemyCollision(enemy) {
        if (this.shouldSkipEnemyCollision(enemy)) return;
        // if (!this.character.isColliding(enemy)) return;
        if (!this.isEndbossAwareCollision(this.character, enemy)) return;
        if (this.handleEndbossAttackCollision(enemy)) return;
        if (this.handleStompCollision(enemy)) return;
        if (this.isEndbossBodyHitBlocked(enemy)) return;
        this.applyCharacterHit(enemy, 4000);
    }


    shouldSkipEnemyCollision(enemy) {
        return enemy.isDead() || this.character.isDead();
    }


    handleEndbossAttackCollision(enemy) {
        if (!(enemy instanceof Endboss)) return false;
        if (!enemy.isAttackAnim()) return false;
        if (enemy.hasHitInCurrentAttack) return true;
        const nowPerf = performance.now();
        if (nowPerf < (enemy.attackHitAllowedAt || 0)) return true;
        this.applyAttackKnockback(enemy);
        this.applyCharacterHit(enemy, 600);
        this.adjustEndbossAtLeftEdge(enemy);
        enemy.resolveAttackContact?.(this.character);
        enemy.hasHitInCurrentAttack = true;
        return true;
    }

    applyAttackKnockback(enemy) {
        this.character.speedY = 15;
        this.keepCharacterInsideBounds();
    }


    handleStompCollision(enemy) {
        if (!this.isChickenEnemy(enemy)) return false;
        if (!this.character.isCollidingFromTop(enemy)) return false;
        this.killChicken(enemy);
        return true;
    }


    isChickenEnemy(enemy) {
        return enemy instanceof Chicken || enemy instanceof SmallChicken;
    }


    killChicken(enemy) {
        enemy.energy = 0;
        enemy.lastHit = Date.now();
        this.playEffectSound(this.sounds.chickenDead);
    }


    isEndbossBodyHitBlocked(enemy) {
        if (!(enemy instanceof Endboss)) return false;
        return performance.now() < (enemy.postAlertCooldownUntil || 0);
    }


    applyCharacterHit(enemy, cooldownMs) {
        const now = Date.now();
        if (enemy.lastHitOnCharacter && now - enemy.lastHitOnCharacter <= cooldownMs) return;
        this.character.hit(enemy);
        enemy.lastHitOnCharacter = now;
        this.updateHealthStatusBar();
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
                this.playEffectSound(this.sounds.collectedCoin);
            }
            if (propertyName === 'bottle') {
                this.playEffectSound(this.sounds.collectedBottle);
            }
        }
    }


    checkBottleHitsEnemies() {
        const now = new Date().getTime();
        this.level.enemies.forEach(enemy => {
            if (enemy.isDead()) return;
            this.throwableObject.forEach(bottle => {
                if (bottle.isSplashed) return;
                if (!this.isEndbossAwareCollision(bottle, enemy)) return;
                if (enemy instanceof Endboss) return this.hitEndbossWithBottle(enemy, bottle, now);
                if (this.isChickenEnemy(enemy)) return this.killChickenWithBottle(enemy, bottle);
            });
        });
    }


    hitEndbossWithBottle(enemy, bottle, now) {
        this.stopEndbossActionSounds();
        const cd = 250;
        enemy.stun(700);
        if (!enemy.lastHit || now - enemy.lastHit > cd) {
            enemy.hit();
            if (!enemy.isDead()) enemy.hurtFlash();
            enemy.lastHit = now;
            this.updateEndbossStatusBar(enemy);
        }
        bottle.splash();
    }


    stopEndbossActionSounds() {
        const sounds = [this.sounds.endbossAppear, this.sounds.endbossAlert, this.sounds.endbossAttack];
        sounds.forEach(s => this.stopSound(s));
    }


    stopSound(sound) {
        if (!sound) return;
        sound.pause();
        sound.currentTime = 0;
    }


    killChickenWithBottle(enemy, bottle) {
        enemy.energy = 0;
        enemy.lastHit = new Date().getTime();
        this.playEffectSound(this.sounds.chickenDead);
        bottle.splash();
    }


    playEffectSound(sound) {
        if (!sound) return;
        const backgroundSounds = sound === this.sounds?.background;
        if ((backgroundSounds && isMusicMuted) || (!backgroundSounds && isSoundMuted)) return;
        this.duckBackground();
        try {
            sound.pause();
            sound.currentTime = 0;
            const playPromise = sound.play();
            if (!playPromise) return;
            playPromise.catch(err => {
                if (err?.name === 'AbortError') return;
                console.warn('Sound konnte nicht abgespielt werden:', err);
            });
        } catch (err) {
            console.warn('Fehler beim Abspielen des Sounds:', err);
        }
    }


    duckBackground() {
        const bg = this.sounds?.background;
        if (!bg) return;
        this.setBackgroundVolume(this.bgBaseVolume * 0.5);
        clearTimeout(this.bgDuckTimeout);
        this.bgDuckTimeout = setTimeout(() => {
            this.setBackgroundVolume(this.bgBaseVolume);
        }, 180);
    }


    setBackgroundVolume(vol) {
        const bg = this.sounds?.background;
        if (!bg) return;
        bg.volume = vol;
    }


    applyBackgroundBaseVolume() {
        const bg = this.sounds?.background;
        if (!bg) return;
        bg.volume = this.bgBaseVolume;
    }


    pauseAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (sound instanceof Audio) {
                sound.pause();
            }
        });
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
            const inTheAirY = this.character.y + 140;
            const baseY = typeof this.character.minY === 'number'
                ? this.character.minY
                : this.character.y;
            const spawnY = baseY + 140;
            let bottle;

            if (this.character.y < 180) {
                // Immer 
                bottle = new ThrowableObject(this.character.x + offsetX, inTheAirY, this, direction); // Wen Pepe in der lüft ist
            } else {
                if (direction === -1) {
                    // Nur am boden nach Links
                    bottle = new ThrowableObject(this.character.x + offsetX, spawnY, this, direction); // Wen Pepe auf dem Boden ist
                } else {
                    // Nur am boden nach Rechts
                    bottle = new ThrowableObject(this.character.x + 50, spawnY, this, direction); // Wen Pepe auf dem Boden ist
                }
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

                    if (typeof onGameOver === 'function') {
                        onGameOver(this);
                    }

                }, Math.min(1200, restBoss + 500));
            }
        }

        this.checkWinCondition();
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }


    checkWinCondition() {
        const boss = this.getEndboss();
        if (!boss || !boss.isDead?.()) return;
        if (!boss.isDeadAnimFinished?.()) return;
        if (this.winScheduled || this.gameOverScheduled) return;
        this.winScheduled = true;
        setTimeout(() => this.showWin(), 1200);
    }


    getEndboss() {
        return this.level?.enemies?.find(e => e instanceof Endboss) || null;
    }


    showWin() {
        this.stopped = true;
        this.winscreen.show();
        if (typeof onWin === 'function') onWin(this);
    }


    drawStaticFrame() {
        this.stopped = false;
        this.draw();
        this.stopped = true;
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
        this.stopAllEnemies();
        this.stopped = true;
        if (this.runTimer) {
            clearInterval(this.runTimer);
            this.runTimer = null;
        }
        this.resetAllSounds();
        this.endscreen?.hide();
        this.winscreen?.hide();
        this.winScheduled = false;
        this.gameOverScheduled = false;
        this.throwableObject = [];
        this.coins = [];
        this.bottles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    stopAllEnemies() {
        this.level?.enemies?.forEach(enemy => enemy.stop?.());
    }


    resetAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (sound instanceof Audio) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }


    isEndbossAwareCollision(a, b) {
        if (a instanceof Endboss) return a.isColliding(b);
        if (b instanceof Endboss) return b.isColliding(a);
        return a.isColliding(b);
    }
}