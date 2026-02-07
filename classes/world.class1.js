/**
 * Represents the game world.
 * Manages rendering, collisions, game loop, sounds, enemies, collectibles and screens.
 */
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


    /**
     * Creates a new game world instance.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @param {KeyBaord} keyBaord - Keyboard input handler.
     */
    constructor(canvas, keyBaord) {
        this.initWorldCore(canvas, keyBaord);
        this.initWorldBackground();
        this.initWorldGameLoop();
        this.initWorldCollectables();
        this.initWorldScreens();
        this.winScheduled = false;
    }


    /**
     * Initializes core world references and state.
     * @param {HTMLCanvasElement} canvas
     * @param {KeyBaord} keyBaord
     */
    initWorldCore(canvas, keyBaord) {
        this.level = this.cloneLevel(level1);
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyBaord = keyBaord;
        this.stopped = false;
        this.backgroundObjects = [];
    }


    /**
     * Initializes background rendering and starts the first draw.
     */
    initWorldBackground() {
        this.initBackground();
        setTimeout(() => this.draw(), 100);
    }


    /**
     * Initializes game loop and world references.
     */
    initWorldGameLoop() {
        this.setWorld();
        this.updateBottleStatusBar();
        this.run();
    }


    /**
     * Initializes collectible objects.
     */
    initWorldCollectables() {
        this.initCollectables(this.coins, Coin, 200, 50);
        this.initCollectables(this.bottles, Bottle, 100, 150);
    }


    /**
     * Initializes win and end screens.
     */
    initWorldScreens() {
        this.endscreen = new Endscreen(this.ctx, this.canvas);
        this.winscreen = new Winscreen(this.ctx, this.canvas);
    }


    /**
     * Creates a deep clone of a level definition.
     * @param {Level} level
     * @returns {Level}
     */
    cloneLevel(level) {
        const enemies = level.enemies.map(e => new e.constructor());
        const clouds = level.clouds.map(c => new c.constructor());
        const backgroundObjects = [];
        const layers = [...level.layers];
        const altLayers = [...level.altLayers];
        return new Level(enemies, clouds, backgroundObjects, layers, altLayers);
    }


    /**
     * Assigns world references to all relevant objects.
     */
    setWorld() {
        this.character.world = this;
        this.throwableObject.world = this;
        this.level.enemies.forEach(enemy => {
            enemy.world = this;
            enemy.animate?.();
        });
    }


    /**
     * Starts the main collision and logic loop.
     */
    run() {
        this.runTimer = setInterval(() => {
            if (isGamePaused || this.stopped) return;
            this.checkCollisions();
            this.checkThrowObject();
            this.checkBottleOnGround();
        }, 1000 / 60);
    }


    /**
     * Checks all collision types.
     */
    checkCollisions() {
        this.collisionWithChicken();
        this.collisionWithCollectable(this.coins, 'coin', this.updateCoinStatusBar);
        this.collisionWithCollectable(this.bottles, 'bottle', this.updateBottleStatusBar);
        this.checkBottleHitsEnemies();
    }


    /**
     * Checks collisions between the character and enemies.
     */
    collisionWithChicken() {
        this.level.enemies.forEach(enemy => this.handleEnemyCollision(enemy));
    }


    /**
     * Handles collision logic with a specific enemy.
     * @param {*} enemy
     */
    handleEnemyCollision(enemy) {
        if (this.shouldSkipEnemyCollision(enemy)) return;
        if (!this.isEndbossAwareCollision(this.character, enemy)) return;
        if (this.handleEndbossAttackCollision(enemy)) return;
        if (this.handleStompCollision(enemy)) return;
        if (this.isEndbossBodyHitBlocked(enemy)) return;
        this.applyCharacterHit(enemy, 4000);
    }


    /**
     * Determines whether enemy collision should be skipped.
     * @param {*} enemy
     * @returns {boolean}
     */
    shouldSkipEnemyCollision(enemy) {
        return enemy.isDead() || this.character.isDead();
    }


    /**
     * Handles collisions during an endboss attack.
     * @param {*} enemy
     * @returns {boolean}
     */
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


    /**
     * Applies knockback to the character after attack.
     */
    applyAttackKnockback() {
        this.character.speedY = 15;
        this.keepCharacterInsideBounds();
    }


    /**
     * Handles stomp collisions.
     * @param {*} enemy
     * @returns {boolean}
     */
    handleStompCollision(enemy) {
        if (!this.isChickenEnemy(enemy)) return false;
        if (!this.character.isCollidingFromTop(enemy)) return false;
        this.killChicken(enemy);
        return true;
    }


    /**
     * Determines whether an enemy is a chicken type.
     * @param {*} enemy
     * @returns {boolean}
     */
    isChickenEnemy(enemy) {
        return enemy instanceof Chicken || enemy instanceof SmallChicken;
    }


    /**
     * Kills a chicken enemy.
     * @param {*} enemy
     */
    killChicken(enemy) {
        enemy.energy = 0;
        enemy.lastHit = Date.now();
        this.playEffectSound(this.sounds.chickenDead);
    }


    /**
     * Checks whether endboss body hits are temporarily blocked.
     * @param {*} enemy
     * @returns {boolean}
     */
    isEndbossBodyHitBlocked(enemy) {
        if (!(enemy instanceof Endboss)) return false;
        return performance.now() < (enemy.postAlertCooldownUntil || 0);
    }


    /**
     * Applies damage to the character with cooldown.
     * @param {*} enemy
     * @param {number} cooldownMs
     */
    applyCharacterHit(enemy, cooldownMs) {
        const now = Date.now();
        if (enemy.lastHitOnCharacter && now - enemy.lastHitOnCharacter <= cooldownMs) return;
        this.character.hit(enemy);
        enemy.lastHitOnCharacter = now;
        this.updateHealthStatusBar();
    }


    /**
     * Ensures the character stays within level bounds.
     */
    keepCharacterInsideBounds() {
        const c = this.character;
        if (!c) return;
        const minX = typeof c.minX === 'number' ? c.minX : -Infinity;
        const level = this.level;
        const maxX = level?.level_end_x ?? Infinity;
        if (c.x < minX) c.x = minX;
        if (c.x > maxX) c.x = maxX;
    }


    /**
     * Adjusts endboss position when colliding at left edge.
     * @param {*} enemy
     */
    adjustEndbossAtLeftEdge(enemy) {
        const char = this.character;
        if (!char || !(enemy instanceof Endboss)) return;
        const charRight = char.x + (char.frameWidth || char.width);
        const gap = 30;
        const desiredBossX = charRight + gap;
        if (enemy.x < desiredBossX) enemy.x = desiredBossX;
    }


    /**
     * Handles collisions with collectible items.
     * @param {Array} array
     * @param {string} propertyName
     * @param {Function} updateStatusBarCallback
     */
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


    /**
     * Checks collisions between bottles and enemies.
     */
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


    /**
     * Handles endboss hit by bottle.
     * @param {*} enemy
     * @param {*} bottle
     * @param {number} now
     */
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


    /**
     * Stops all active endboss action sounds.
     */
    stopEndbossActionSounds() {
        const sounds = [this.sounds.endbossAppear, this.sounds.endbossAlert, this.sounds.endbossAttack];
        sounds.forEach(s => this.stopSound(s));
    }


    /**
     * Stops and resets a sound.
     * @param {Audio} sound
     */
    stopSound(sound) {
        if (!sound) return;
        sound.pause();
        sound.currentTime = 0;
    }


    /**
     * Kills a chicken enemy using a bottle.
     * @param {*} enemy
     * @param {*} bottle
     */
    killChickenWithBottle(enemy, bottle) {
        enemy.energy = 0;
        enemy.lastHit = new Date().getTime();
        this.playEffectSound(this.sounds.chickenDead);
        bottle.splash();
    }


    /**
     * Plays a sound effect with background ducking.
     * @param {Audio} sound
     */
    playEffectSound(sound) {
        if (!this.canPlaySound(sound)) return;
        this.duckBackground();
        this.tryRestartAndPlaySound(sound);
    }


    /**
     * Determines whether a sound is allowed to play.
     * @param {Audio} sound
     * @returns {boolean}
     */
    canPlaySound(sound) {
        if (!sound) return false;
        const backgroundSounds = this.isBackgroundSound(sound);
        if (this.isMutedForSoundType(backgroundSounds)) return false;
        return true;
    }


    /**
     * Checks whether a sound is the background track.
     * @param {Audio} sound
     * @returns {boolean}
     */
    isBackgroundSound(sound) {
        return sound === this.sounds?.background;
    }


    /**
    * Returns whether playback should be muted depending on sound type.
    * Uses global mute flags for music and sound effects.
    * @param {boolean} backgroundSounds - True if the requested sound is background music.
    * @returns {boolean} True if the sound type is currently muted.
    */
    isMutedForSoundType(backgroundSounds) {
        if (backgroundSounds) return isMusicMuted;
        return isSoundMuted;
    }


    /**
     * Restarts and plays a sound with error handling.
     * @param {Audio} sound
     */
    tryRestartAndPlaySound(sound) {
        try {
            this.restartSound(sound);
            this.playSoundWithPromiseHandling(sound);
        } catch (err) {
            console.log('Fehler beim Abspielen des Sounds:', err);
        }
    }


    /**
     * Restarts a sound.
     * @param {Audio} sound
     */
    restartSound(sound) {
        sound.pause();
        sound.currentTime = 0;
    }


    /**
     * Handles play promise rejections.
     * @param {*} sound
     */
    playSoundWithPromiseHandling(sound) {
        const playPromise = sound.play();
        if (!playPromise) return;
        playPromise.catch(err => {
            if (err?.name !== 'AbortError') {
                console.log('Sound konnte nicht abgespielt werden:', err);
            }
        });
    }


    /**
    * Temporarily lowers background music volume.
    */
    duckBackground() {
        const bg = this.sounds?.background;
        if (!bg) return;
        const base = getBackgroundBaseVolume?.() ?? 0.1;
        this.setBackgroundVolume(base * 0.5);
        clearTimeout(this.bgDuckTimeout);
        this.bgDuckTimeout = setTimeout(() => this.setBackgroundVolume(base), 180);
    }


    /**
     * Sets background music volume.
     * @param {number} vol
     */
    setBackgroundVolume(vol) {
        const bg = this.sounds?.background;
        if (!bg) return;
        bg.volume = vol;
    }


    /**
     * Pauses all sounds.
     */
    pauseAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (sound instanceof Audio) sound.pause();
        });
    }


    /**
     * Initializes collectibles across level segments.
     * @param {Array} array
     * @param {Function} ClassRef
     * @param {number} offsetMinX
     * @param {number} offsetMaxX
     */
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


    /**
     * Handles bottle throwing input.
     */
    checkThrowObject() {
        const now = Date.now();
        if (!this.canThrowBottle(now)) return;
        const direction = this.getThrowDirection();
        const bottle = this.createThrowableBottle(direction);
        this.addBottleToWorld(bottle);
        this.consumeBottleAndUpdate(now);
    }


    /**
     * Determines whether a bottle can be thrown.
     * @param {number} now
     * @returns {boolean}
     */
    canThrowBottle(now) {
        return this.keyBaord.THROW &&
            this.character.bottle > 0 &&
            now - this.lastBottleThrow > 500;
    }


    /**
     * Returns the throw direction based on character facing.
     * @returns {number}
     */
    getThrowDirection() {
        return this.character.otherDirection ? -1 : 1;
    }


    /**
     * Creates a throwable bottle instance.
     * @param {number} direction
     * @returns {ThrowableObject}
     */
    createThrowableBottle(direction) {
        const pos = this.getBottleSpawnPosition(direction);
        return new ThrowableObject(pos.x, pos.y, this, direction);
    }


    /**
     * Resolves bottle spawn position.
     * @param {number} direction
     * @returns {{x:number, y:number}}
     */
    getBottleSpawnPosition(direction) {
        if (this.isCharacterInAir()) return this.getAirBottlePosition(direction);
        return this.getGroundBottlePosition(direction);
    }


    /**
     * Checks whether the character is in the air.
     * @returns {boolean}
     */
    isCharacterInAir() {
        return this.character.y < 180;
    }


    /**
     * Gets bottle spawn position while in air.
     * @param {number} direction
     * @returns {{x:number, y:number}}
     */
    getAirBottlePosition(direction) {
        const offsetX = direction * 30;
        return { x: this.character.x + offsetX, y: this.character.y + 140 };
    }


    /**
     * Gets bottle spawn position while on ground.
     * @param {number} direction
     * @returns {{x:number, y:number}}
     */
    getGroundBottlePosition(direction) {
        const y = this.getGroundSpawnY();
        if (direction === -1) return this.getGroundLeftBottlePosition(y, direction);
        return { x: this.character.x + 50, y };
    }


    /**
     * Gets left-facing ground bottle spawn position.
     * @param {number} y
     * @param {number} direction
     * @returns {{x:number, y:number}}
     */
    getGroundLeftBottlePosition(y, direction) {
        const offsetX = direction * 30;
        return { x: this.character.x + offsetX, y };
    }


    /**
     * Calculates ground spawn y-position.
     * @returns {number}
     */
    getGroundSpawnY() {
        const baseY = typeof this.character.minY === 'number'
            ? this.character.minY
            : this.character.y;
        return baseY + 140;
    }


    /**
     * Adds a bottle to the world.
     * @param {ThrowableObject} bottle
     */
    addBottleToWorld(bottle) {
        this.throwableObject.push(bottle);
    }


    /**
     * Consumes a bottle and updates state.
     * @param {number} now
     */
    consumeBottleAndUpdate(now) {
        this.character.bottle -= 5;
        if (this.character.bottle < 0) this.character.bottle = 0;
        this.updateBottleStatusBar();
        this.lastBottleThrow = now;
    }


    /**
     * Updates health status bar.
     */
    updateHealthStatusBar() {
        this.healthBar.setPercentage(this.character.energy);
    }


    /**
     * Updates coin status bar.
     */
    updateCoinStatusBar() {
        this.coinBar.setPercentage(this.character.coin);
    }


    /**
     * Updates bottle status bar.
     */
    updateBottleStatusBar() {
        this.bottleBar.setPercentage(this.character.bottle);
    }


    /**
     * Updates endboss status bar.
     * @param {*} endboss
     */
    updateEndbossStatusBar(endboss) {
        this.endbossBar.setPercentage(endboss.energy);
    }


    /**
     * Checks bottles hitting the ground.
     */
    checkBottleOnGround() {
        this.throwableObject.forEach((bottle) => {
            if (!bottle.isSplashed && bottle.isOnGround()) {
                bottle.splash();
            }
        });
    }


    /**
     * Initializes background tiles.
     */
    initBackground() {
        for (let i = -1; i < this.backgroundTileCount; i++) {
            const xPos = i * 720;
            const currentLayers = i % 2 === 0 ? this.level.layers : this.level.altLayers;
            this.addTile(xPos, currentLayers);
        }
    }


    /**
     * Adds a background tile at a given position.
     * @param {number} xPos
     * @param {string[]} layers
     */
    addTile(xPos, layers) {
        layers.forEach(imagePath => {
            this.level.backgroundObjects.push(new BackgroundObject(imagePath, xPos));
        });
    }


    /**
     * Main draw loop.
     */
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


    /**
     * Clears the canvas.
     */
    clearWorldCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    /**
     * Draws world objects with camera translation.
     */
    drawWorldObjectsWithCamera() {
        this.ctx.translate(this.camera_x, 0);
        this.drawWorldObjects();
        this.tryAddNextBackgroundTile();
        this.ctx.translate(-this.camera_x, 0);
    }


    /**
     * Draws all world objects.
     */
    drawWorldObjects() {
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addToMap(this.character);
        this.addObjectsToMap(this.coins);
        this.addObjectsToMap(this.bottles);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObject);
    }


    /**
     * Adds next background tile if needed.
     */
    tryAddNextBackgroundTile() {
        if (this.character.x + this.canvas.width <= this.backgroundTileCount * 720) return;
        this.addBackgroundTile(this.backgroundTileCount);
        this.backgroundTileCount++;
    }


    /**
     * Draws all status bars.
     */
    drawStatusBars() {
        this.addToMap(this.healthBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.endbossBar);
    }


    /**
     * Schedules game over when character is dead.
     */
    scheduleGameOverIfDead() {
        if (!this.character.isDead()) return;
        if (this.gameOverScheduled) return;
        this.gameOverScheduled = true;
        this.scheduleGameOverTimeout();
    }


    /**
     * Schedules delayed game over.
     */
    scheduleGameOverTimeout() {
        const boss = this.level.enemies.find(e => e instanceof Endboss);
        const restBoss = (boss?.currentAnimation === 'attack')
            ? Math.max(0, (boss.attackUntil || 0) - performance.now())
            : 0;
        setTimeout(() => this.finishGameOver(), Math.min(1200, restBoss + 500));
    }


    /**
     * Finalizes game over.
     */
    finishGameOver() {
        this.stopped = true;
        this.endscreen.show();
        this.callOnGameOverIfExists();
    }


    /**
    * Calls the global game-over callback if it exists.
    */
    callOnGameOverIfExists() {
        if (typeof onGameOver !== 'function') return;
        onGameOver(this);
    }


    /**
     * Requests next animation frame.
     */
    requestNextFrame() {
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }


    /**
     * Checks win condition.
     */
    checkWinCondition() {
        const boss = this.getEndboss();
        if (!boss || !boss.isDead?.() || !boss.isDeadAnimFinished?.()) return;
        if (this.winScheduled || this.gameOverScheduled) return;
        this.winScheduled = true;
        setTimeout(() => this.showWin(), 1200);
    }


    /**
     * Returns the endboss instance.
     * @returns {*|null}
     */
    getEndboss() {
        return this.level?.enemies?.find(e => e instanceof Endboss) || null;
    }


    /**
     * Shows the win screen.
     */
    showWin() {
        this.stopped = true;
        this.winscreen.show();
        if (typeof onWin === 'function') onWin(this);
    }


    /**
     * Draws a static frame without game loop.
     */
    drawStaticFrame() {
        this.stopped = false;
        this.draw();
        this.stopped = true;
    }


    /**
     * Adds a new background tile dynamically.
     * @param {number} tileIndex
     */
    addBackgroundTile(tileIndex) {
        const xPos = tileIndex * 720;
        const currentLayers = tileIndex % 2 === 0 ? this.level.layers : this.level.altLayers;
        this.addTile(xPos, currentLayers);
    }


    /**
     * Adds multiple objects to the map.
     * @param {Array} objects
     */
    addObjectsToMap(objects) {
        objects.forEach(obj => this.addToMap(obj));
    }


    /**
     * Draws a single object to the map.
     * @param {*} mo
     */
    addToMap(mo) {
        this.ctx.save();
        if (mo.otherDirection) this.flipImage(mo);
        if (!mo.otherDirection) this.flipImageBack(mo);
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        this.ctx.restore();
    }


    /**
     * Flips drawing context horizontally.
     * @param {*} mo
     */
    flipImage(mo) {
        this.ctx.translate(mo.x + mo.width, mo.y);
        this.ctx.scale(-1, 1);
    }


    /**
     * Resets context after flipping.
     * @param {*} mo
     */
    flipImageBack(mo) {
        this.ctx.translate(mo.x, mo.y);
    }


    /**
     * Destroys the world and resets all state.
     */
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


    /**
     * Stops the main run timer.
     */
    stopRunTimer() {
        if (!this.runTimer) return;
        clearInterval(this.runTimer);
        this.runTimer = null;
    }


    /**
     * Hides all overlay screens.
     */
    hideScreens() {
        this.endscreen?.hide();
        this.winscreen?.hide();
    }


    /**
     * Resets win/game over state flags.
     */
    resetEndStates() {
        this.winScheduled = false;
        this.gameOverScheduled = false;
    }


    /**
     * Resets world object collections.
     */
    resetWorldObjects() {
        this.throwableObject = [];
        this.coins = [];
        this.bottles = [];
    }


    /**
     * Stops all enemies.
     */
    stopAllEnemies() {
        this.level?.enemies?.forEach(enemy => enemy.stop?.());
    }


    /**
     * Stops and resets all sounds.
     */
    resetAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (!(sound instanceof Audio)) return;
            sound.pause();
            sound.currentTime = 0;
        });
    }


    /**
     * Performs collision check with endboss awareness.
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     */
    isEndbossAwareCollision(a, b) {
        if (a instanceof Endboss) return a.isColliding(b);
        if (b instanceof Endboss) return b.isColliding(a);
        return a.isColliding(b);
    }
}