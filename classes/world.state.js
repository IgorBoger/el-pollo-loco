/**
 * Starts the main collision and logic loop.
 */
World.prototype.run = function() {
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
World.prototype.updateHealthStatusBar = function() {
    this.healthBar.setPercentage(this.character.energy);
}


/**
 * Updates coin status bar.
 */
World.prototype.updateCoinStatusBar = function() {
    this.coinBar.setPercentage(this.character.coin);
}


/**
 * Updates bottle status bar.
 */
World.prototype.updateBottleStatusBar = function() {
    this.bottleBar.setPercentage(this.character.bottle);
}


/**
 * Updates endboss status bar.
 * @param {*} endboss
 */
World.prototype.updateEndbossStatusBar = function(endboss) {
    this.endbossBar.setPercentage(endboss.energy);
}


/**
 * Schedules game over when character is dead.
 */
World.prototype.scheduleGameOverIfDead = function() {
    if (!this.character.isDead()) return;
    if (this.gameOverScheduled) return;
    this.gameOverScheduled = true;
    this.scheduleGameOverTimeout();
}


/**
 * Schedules delayed game over.
 */
World.prototype.scheduleGameOverTimeout = function() {
    const boss = this.level.enemies.find(e => e instanceof Endboss);
    const restBoss = (boss?.currentAnimation === 'attack')
        ? Math.max(0, (boss.attackUntil || 0) - performance.now())
        : 0;
    setTimeout(() => this.finishGameOver(), Math.min(1200, restBoss + 500));
}


/**
 * Finalizes game over.
 */
World.prototype.finishGameOver = function() {
    this.stopped = true;
    this.endscreen.show();
    this.callOnGameOverIfExists();
}


/**
* Calls the global game-over callback if it exists.
*/
World.prototype.callOnGameOverIfExists = function() {
    if (typeof onGameOver !== 'function') return;
    onGameOver(this);
}


/**
 * Requests next animation frame.
 */
World.prototype.requestNextFrame = function() {
    let self = this;
    requestAnimationFrame(function () {
        self.draw();
    });
}


/**
 * Checks win condition.
 */
World.prototype.checkWinCondition = function() {
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
World.prototype.getEndboss = function() {
    return this.level?.enemies?.find(e => e instanceof Endboss) || null;
}


/**
 * Shows the win screen.
 */
World.prototype.showWin = function() {
    this.stopped = true;
    this.winscreen.show();
    if (typeof onWin === 'function') onWin(this);
}


/**
 * Destroys the world and resets all state.
 */
World.prototype.destroy = function() {
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
World.prototype.stopRunTimer = function() {
    if (!this.runTimer) return;
    clearInterval(this.runTimer);
    this.runTimer = null;
}


/**
 * Hides all overlay screens.
 */
World.prototype.hideScreens = function() {
    this.endscreen?.hide();
    this.winscreen?.hide();
}


/**
 * Resets win/game over state flags.
 */
World.prototype.resetEndStates = function() {
    this.winScheduled = false;
    this.gameOverScheduled = false;
}


/**
 * Resets world object collections.
 */
World.prototype.resetWorldObjects = function() {
    this.throwableObject = [];
    this.coins = [];
    this.bottles = [];
}


/**
 * Stops all enemies.
 */
World.prototype.stopAllEnemies = function() {
    this.level?.enemies?.forEach(enemy => enemy.stop?.());
}