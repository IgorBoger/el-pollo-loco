/**
 * Starts the main collision and logic loop.
 */
World.prototype.run = function () {
    this.runTimer = setInterval(() => {
        if (isGamePaused || this.stopped) return;
        this.checkCollisions();
        this.checkThrowObject();
        this.checkBottleOnGround();
    }, 1000 / 60);
}


/**
 * Updates health status bar.
 */
World.prototype.updateHealthStatusBar = function () {
    this.healthBar.setPercentage(this.character.energy);
}


/**
 * Updates coin status bar.
 */
World.prototype.updateCoinStatusBar = function () {
    this.coinBar.setPercentage(this.character.coin);
}


/**
 * Updates bottle status bar.
 */
World.prototype.updateBottleStatusBar = function () {
    this.bottleBar.setPercentage(this.character.bottle);
}


/**
 * Updates endboss status bar.
 * @param {*} endboss
 */
World.prototype.updateEndbossStatusBar = function (endboss) {
    this.endbossBar.setPercentage(endboss.energy);
}


/**
 * Schedules game over when character is dead.
 */
World.prototype.scheduleGameOverIfDead = function () {
    // if (!this.character.isDead()) return;
    if (!this.character || !this.character.isDead()) return;
    if (this.gameOverScheduled) return;
    this.gameOverScheduled = true;
    this.freezeGameOverStart();
    this.scheduleGameOverTimeout();
}


/**
 * Returns whether controls are currently locked.
 * @returns {boolean}
 */
World.prototype.isControlsLocked = function () {
    return !!this.controlsLocked;
}


/**
 * Freezes gameplay when game over starts.
 * @returns {void}
 */
World.prototype.freezeGameOverStart = function () {
    this.freezeGameplayOnce('isGameOverFrozen');
    this.stopEndbossActionSounds?.();
    this.stopEnemiesAfterEndbossAttack();
}


/**
 * Freezes gameplay immediately and ensures it runs only once per flag.
 * @param {string} freezeFlagProp
 * @returns {void}
 */
World.prototype.freezeGameplayOnce = function (freezeFlagProp) {
    if (this[freezeFlagProp]) return;
    this[freezeFlagProp] = true;
    this.setControlsLocked(true);
    this.clearKeyboardInput();
    this.stopCharacterMotion();
}


/**
 * Sets the controls lock state.
 * @param {boolean} isLocked
 * @returns {void}
 */
World.prototype.setControlsLocked = function (isLocked) {
    this.controlsLocked = !!isLocked;
}


/**
 * Stops enemies after the endboss finishes the current attack (prevents slide-through on last hit).
 * @returns {void}
 */
World.prototype.stopEnemiesAfterEndbossAttack = function () {
    const boss = this.getEndboss?.();
    const restBoss = (boss?.currentAnimation === 'attack')
        ? Math.max(0, (boss.attackUntil || 0) - performance.now())
        : 0;
}


/**
 * Freezes gameplay when win starts.
 * @returns {void}
 */
World.prototype.freezeWinStart = function () {
    this.freezeGameplayOnce('isWinFrozen');
}


/**
 * Sets the global pause state.
 * @param {boolean} isPaused
 * @returns {void}
 */
World.prototype.setGamePaused = function (isPaused) {
    window.isGamePaused = !!isPaused;
    isGamePaused = !!isPaused;
}


/**
 * Clears all keyboard inputs to prevent further movement/actions.
 * @returns {void}
 */
World.prototype.clearKeyboardInput = function () {
    if (!this.keyBaord) return;
    this.keyBaord.LEFT = false;
    this.keyBaord.RIGHT = false;
    this.keyBaord.UP = false;
    this.keyBaord.DOWN = false;
    this.keyBaord.SPACE = false;
    this.keyBaord.THROW = false;
}


/**
 * Stops the character motion instantly (no sliding after death).
 * @returns {void}
 */
World.prototype.stopCharacterMotion = function () {
    if (!this.character) return;
    this.character.speedY = 0;
    this.character.lastJumpPressedAt = -Infinity;
}


/**
 * Schedules delayed game over.
 */
World.prototype.scheduleGameOverTimeout = function () {
    const boss = this.level.enemies.find(e => e instanceof Endboss);
    const restBoss = (boss?.currentAnimation === 'attack')
        ? Math.max(0, (boss.attackUntil || 0) - performance.now())
        : 0;
    const deadDuration = this.character?.IMAGES_DEAD?.length * this.character.deadFrameMs || 0;
    const extraWaitMs = 500;
    const delay = Math.max(deadDuration + extraWaitMs, restBoss + 500);
    setTimeout(() => this.finishGameOver(), delay);
}


// /**
//  * Finalizes game over.
//  */
World.prototype.finishGameOver = function () {
    this.stopped = true;
    this.hideCharacter = true;
    this.drawStaticFrame();
    this.endscreen.show();
    this.callOnGameOverIfExists();
}


/**
* Calls the global game-over callback if it exists.
*/
World.prototype.callOnGameOverIfExists = function () {
    if (typeof onGameOver !== 'function') return;
    onGameOver(this);
}


/**
 * Requests next animation frame.
 */
World.prototype.requestNextFrame = function () {
    let self = this;
    requestAnimationFrame(function () {
        self.draw();
    });
}


/**
 * Checks win condition.
 *
 * @returns {void}
 */
World.prototype.checkWinCondition = function () {
    const boss = this.getEndboss();
    if (!boss || this.gameOverScheduled) return;
    if (boss.isDead?.()) this.freezeWinStart();
    if (!boss.isDead?.() || !boss.isDeadAnimFinished?.()) return;
    if (this.winScheduled) return;
    this.winScheduled = true;
    setTimeout(() => this.showWin(), 1200);
}



/**
 * Returns the endboss instance.
 * @returns {*|null}
 */
World.prototype.getEndboss = function () {
    return this.level?.enemies?.find(e => e instanceof Endboss) || null;
}


/**
 * Shows the win screen.
 */
World.prototype.showWin = function () {
    this.stopped = true;
    this.winscreen.show();
    if (typeof onWin === 'function') onWin(this);
}


/**
 * Destroys the world and resets all state.
 */
World.prototype.destroy = function () {
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
World.prototype.stopRunTimer = function () {
    if (!this.runTimer) return;
    clearInterval(this.runTimer);
    this.runTimer = null;
}


/**
 * Hides all overlay screens.
 */
World.prototype.hideScreens = function () {
    this.endscreen?.hide();
    this.winscreen?.hide();
}


/**
 * Resets win/game over state flags.
 */
World.prototype.resetEndStates = function () {
    this.winScheduled = false;
    this.gameOverScheduled = false;
    this.hideCharacter = false;
    this.isGameOverFrozen = false;
    this.isWinFrozen = false;
    this.setGamePaused(false);
    this.setControlsLocked(false);
}


/**
 * Resets world object collections.
 */
World.prototype.resetWorldObjects = function () {
    this.throwableObject = [];
    this.coins = [];
    this.bottles = [];
}


/**
 * Stops all enemies.
 */
World.prototype.stopAllEnemies = function () {
    this.level?.enemies?.forEach(enemy => enemy.stop?.());
}


/**
 * Updates world animation state once per frame.
 * @param {number} now
 * @returns {void}
 */
World.prototype.updateWorldAnimations = function (now) {
    this.updateCoinAnimations(now);
}


/**
 * Updates animations for all coins in the world.
 * @param {number} now
 * @returns {void}
 */
World.prototype.updateCoinAnimations = function (now) {
    if (!this.coins?.length) return;
    this.coins.forEach(c => c.updateAnimation?.(now));
}


/**
 * Freezes gameplay immediately when the character dies to prevent enemy "after ticks".
 * @returns {void}
 */
World.prototype.freezeOnDeathImmediate = function () {
    if (!this.character?.isDead?.()) return;
    this.scheduleGameOverIfDead?.();
};