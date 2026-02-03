class World {
    character = new Character();
    healthBar = new StatusBar('health');
    coinBar = new StatusBar('coin');
    bottleBar = new StatusBar('bottle');
    endbossBar = new StatusBar('endboss');
    sounds = {
        background: new Audio('audio/background.mp3'),
        pepeWalk: new Audio('audio/pepe_walk.mp3'),
        pepeJump: new Audio('audio/pepe_jump.mp3'),
        pepeHurt: new Audio('audio/pepe_hurt.mp3'),
        pepeDead: new Audio('audio/pepe_dead.mp3'),
        pepeSnoring: new Audio('audio/pepe_snoring.mp3'),
        pepeCalmBreathing: new Audio('audio/pepe_calm_breathing.mp3'),
        collectedCoin: new Audio('audio/collected_coin.mp3'),
        collectedBottle: new Audio('audio/collected_bottle.mp3'),
        thrownBottle: new Audio('audio/thrown_bottle.mp3'),
        chickenDead: new Audio('audio/chicken_dead.mp3'),
        endbossAppear: new Audio('audio/endboss_appear.mp3'),
        endbossAlert: new Audio('audio/endboss_alert.mp3'),
        endbossAttack: new Audio('audio/endboss_attack.mp3'),
        endbossHurt: new Audio('audio/endboss_hurt.mp3'),
        endbossDead: new Audio('audio/endboss_dead.mp3')
    };
    coins = [];
    bottles = [];
    throwableObject = [];
    level = level1;
    backgroundTileCount = 1;
    canvas;
    ctx;
    keyBaord;
    camera_x = 0;
    lastBottleThrow = 0;
    lastDrawLogTime = 0;


    constructor(canvas, keyBaord) {
        this.initWorldCore(canvas, keyBaord);
        this.initWorldBackground();
        this.initWorldGameLoop();
        this.initWorldCollectables();
        this.initWorldScreens();
        this.winScheduled = false;
    }


    initWorldCore(canvas, keyBaord) {
        this.level = this.cloneLevel(level1);
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyBaord = keyBaord;
        this.stopped = false;
        this.backgroundObjects = [];
    }


    initWorldBackground() {
        this.initBackground();
        setTimeout(() => this.draw(), 100);
    }


    initWorldGameLoop() {
        this.setWorld();
        this.updateBottleStatusBar();
        this.run();
    }


    initWorldCollectables() {
        this.initCollectables(this.coins, Coin, 200, 50);
        this.initCollectables(this.bottles, Bottle, 100, 150);
    }


    initWorldScreens() {
        this.endscreen = new Endscreen(this.ctx, this.canvas);
        this.winscreen = new Winscreen(this.ctx, this.canvas);
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
            if (propertyName === 'coin') this.playEffectSound(this.sounds.collectedCoin);
            if (propertyName === 'bottle') this.playEffectSound(this.sounds.collectedBottle);
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
        if (!this.canPlaySound(sound)) return;
        this.duckBackground();
        this.tryRestartAndPlaySound(sound);
    }


    canPlaySound(sound) {
        if (!sound) return false;
        const backgroundSounds = this.isBackgroundSound(sound);
        if (this.isMutedForSoundType(backgroundSounds)) return false;
        return true;
    }


    isBackgroundSound(sound) {
        return sound === this.sounds?.background;
    }


    isMutedForSoundType(backgroundSounds) {
        if (backgroundSounds) return isMusicMuted;
        return isSoundMuted;
    }


    tryRestartAndPlaySound(sound) {
        try {
            this.restartSound(sound);
            this.playSoundWithPromiseHandling(sound);
        } catch (err) {
            this.warnSoundError('Fehler beim Abspielen des Sounds:', err);
        }
    }


    restartSound(sound) {
        sound.pause();
        sound.currentTime = 0;
    }


    playSoundWithPromiseHandling(sound) {
        const playPromise = sound.play();
        if (!playPromise) return;
        playPromise.catch(err => this.handlePlayPromiseError(err));
    }


    handlePlayPromiseError(err) {
        if (err?.name === 'AbortError') return;
        this.warnSoundError('Sound konnte nicht abgespielt werden:', err);
    }


    warnSoundError(message, err) {
        console.warn(message, err);
    }


    duckBackground() {
        const bg = this.sounds?.background;
        if (!bg) return;
        const base = getBackgroundBaseVolume?.() ?? 0.1;
        this.setBackgroundVolume(base * 0.5);
        clearTimeout(this.bgDuckTimeout);
        this.bgDuckTimeout = setTimeout(() => this.setBackgroundVolume(base), 180);
    }


    setBackgroundVolume(vol) {
        const bg = this.sounds?.background;
        if (!bg) return;
        bg.volume = vol;
    }


    pauseAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (!(sound instanceof Audio)) return;
            sound.pause();
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
        if (!this.canThrowBottle(now)) return;
        const direction = this.getThrowDirection();
        const bottle = this.createThrowableBottle(direction);
        this.addBottleToWorld(bottle);
        this.consumeBottleAndUpdate(now);
    }


    canThrowBottle(now) {
        return this.keyBaord.THROW &&
            this.character.bottle > 0 &&
            now - this.lastBottleThrow > 500;
    }


    getThrowDirection() {
        return this.character.otherDirection ? -1 : 1;
    }


    createThrowableBottle(direction) {
        const pos = this.getBottleSpawnPosition(direction);
        return new ThrowableObject(pos.x, pos.y, this, direction);
    }


    getBottleSpawnPosition(direction) {
        if (this.isCharacterInAir()) return this.getAirBottlePosition(direction);
        return this.getGroundBottlePosition(direction);
    }


    isCharacterInAir() {
        return this.character.y < 180;
    }


    getAirBottlePosition(direction) {
        const offsetX = direction * 30;
        return { x: this.character.x + offsetX, y: this.character.y + 140 };
    }


    getGroundBottlePosition(direction) {
        const y = this.getGroundSpawnY();
        if (direction === -1) return this.getGroundLeftBottlePosition(y, direction);
        return { x: this.character.x + 50, y };
    }


    getGroundLeftBottlePosition(y, direction) {
        const offsetX = direction * 30;
        return { x: this.character.x + offsetX, y };
    }


    getGroundSpawnY() {
        const baseY = typeof this.character.minY === 'number'
            ? this.character.minY
            : this.character.y;
        return baseY + 140;
    }


    addBottleToWorld(bottle) {
        this.throwableObject.push(bottle);
    }


    consumeBottleAndUpdate(now) {
        this.character.bottle -= 5;
        if (this.character.bottle < 0) this.character.bottle = 0;
        this.updateBottleStatusBar();
        this.lastBottleThrow = now;
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


    initBackground() {
        for (let i = -1; i < this.backgroundTileCount; i++) {
            const xPos = i * 720;
            const currentLayers = i % 2 === 0 ? this.level.layers : this.level.altLayers;
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
        this.clearWorldCanvas();
        this.drawWorldObjectsWithCamera();
        this.drawStatusBars();
        this.scheduleGameOverIfDead();
        this.checkWinCondition();
        this.requestNextFrame();
    }


    clearWorldCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    drawWorldObjectsWithCamera() {
        this.ctx.translate(this.camera_x, 0);
        this.drawWorldObjects();
        this.tryAddNextBackgroundTile();
        this.ctx.translate(-this.camera_x, 0);
    }


    drawWorldObjects() {
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addToMap(this.character);
        this.addObjectsToMap(this.coins);
        this.addObjectsToMap(this.bottles);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObject);
    }


    tryAddNextBackgroundTile() {
        if (this.character.x + this.canvas.width <= this.backgroundTileCount * 720) return;
        this.addBackgroundTile(this.backgroundTileCount);
        this.backgroundTileCount++;
    }


    drawStatusBars() {
        this.addToMap(this.healthBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.endbossBar);
    }


    scheduleGameOverIfDead() {
        if (!this.character.isDead()) return;
        if (this.gameOverScheduled) return;
        this.gameOverScheduled = true;
        this.scheduleGameOverTimeout();
    }


    scheduleGameOverTimeout() {
        const boss = this.level.enemies.find(e => e instanceof Endboss);
        const restBoss = (boss?.currentAnimation === 'attack')
            ? Math.max(0, (boss.attackUntil || 0) - performance.now())
            : 0;
        setTimeout(() => this.finishGameOver(), Math.min(1200, restBoss + 500));
    }


    finishGameOver() {
        this.stopped = true;
        this.endscreen.show();
        this.callOnGameOverIfExists();
    }


    callOnGameOverIfExists() {
        if (typeof onGameOver !== 'function') return;
        onGameOver(this);
    }


    requestNextFrame() {
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
        if (mo.otherDirection) this.flipImage(mo);
        if (!mo.otherDirection) this.flipImageBack(mo);
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
        this.stopRunTimer();
        this.resetAllSounds();
        this.hideScreens();
        this.resetEndStates();
        this.resetWorldObjects();
        this.clearWorldCanvas();
    }


    stopRunTimer() {
        if (!this.runTimer) return;
        clearInterval(this.runTimer);
        this.runTimer = null;
    }


    hideScreens() {
        this.endscreen?.hide();
        this.winscreen?.hide();
    }


    resetEndStates() {
        this.winScheduled = false;
        this.gameOverScheduled = false;
    }


    resetWorldObjects() {
        this.throwableObject = [];
        this.coins = [];
        this.bottles = [];
    }


    stopAllEnemies() {
        this.level?.enemies?.forEach(enemy => enemy.stop?.());
    }


    resetAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (!(sound instanceof Audio)) return;
            sound.pause();
            sound.currentTime = 0;
        });
    }


    isEndbossAwareCollision(a, b) {
        if (a instanceof Endboss) return a.isColliding(b);
        if (b instanceof Endboss) return b.isColliding(a);
        return a.isColliding(b);
    }
}