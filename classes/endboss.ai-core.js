/**
 * Starts the 60 FPS AI loop interval.
 */
Endboss.prototype.startAiLoop = function() {
    this.aiInterval = setInterval(() => this.tickAi(), 1000 / 60);
};


/**
 * AI tick: updates state, movement and decisions if not paused/stopped.
 */
Endboss.prototype.tickAi = function() {
    if (window.isGamePaused || this.world?.stopped) return;
    if (this.handleDeath() || !this.world?.character) return;
    const now = performance.now();
    const dist = this.getHorizontalGap(this.world.character, this);
    const pepeX = this.getCenterX(this.world.character);
    this.updateRecoveryOrAi(now, pepeX, dist);
    this.updateFacing();
    this.applyWalkBob(now);
    this.applyHorizontalMotion();
};


/**
 * Runs recovery behavior first or normal AI otherwise.
 * @param {number} now
 * @param {number} pepeX
 * @param {number} dist
 */
Endboss.prototype.updateRecoveryOrAi = function(now, pepeX, dist) {
    if (this.isInRecovery(now)) {
        this.applyRecovery();
        return;
    }
    this.updateAI(now, pepeX, dist);
};


/**
 * Starts the animation loop interval.
 */
Endboss.prototype.startAnimationLoop = function() {
    this.animationInterval = setInterval(() => this.tickAnimation(), 50);
};


/**
 * Animation tick: advances animation frames if not paused/stopped.
 */
Endboss.prototype.tickAnimation = function() {
    if (window.isGamePaused || this.world?.stopped) return;
    this.updateFrames();
};


/**
 * Gets the center x-position of an object.
 * @param {object} obj
 * @returns {number}
 */
Endboss.prototype.getCenterX = function(obj) {
    const w = obj.width || 0;
    return obj.x + w / 2;
};


/**
 * Computes the horizontal gap between two rectangles (0 if overlapping).
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
Endboss.prototype.getHorizontalGap = function(a, b) {
    const aLeft = a.x;
    const aRight = a.x + (a.width || 0);
    const bLeft = b.x;
    const bRight = b.x + (b.width || 0);
    if (aRight < bLeft) return bLeft - aRight;
    if (bRight < aLeft) return aLeft - bRight;
    return 0;
};


/**
 * Handles death state and schedules removal.
 * @returns {boolean} True if the endboss is dead.
 */
Endboss.prototype.handleDeath = function() {
    if (!this.isDead()) return false;
    const changedToDead = this.setAnimation('dead');
    this.handleDeadStateChange(changedToDead);
    this.currentSpeed = 0;
    this.scheduleRemovalAfterDeath();
    return true;
};


/**
 * Runs one-time actions when switching to the dead animation.
 * @param {boolean} changedToDead
 */
Endboss.prototype.handleDeadStateChange = function(changedToDead) {
    if (!changedToDead) return;
    this.playEndbossDeadSound();
    this.initDeadAnimTimer();
};


/**
 * Schedules removing the dead endboss from the world.
 */
Endboss.prototype.scheduleRemovalAfterDeath = function() {
    setTimeout(() => this.removeDeadEndboss(), 2000);
};


/**
 * Removes the dead endboss and stops its loops.
 */
Endboss.prototype.removeDeadEndboss = function() {
    this.removeFromEnemyList();
    this.stopEndbossIntervals();
};


/**
 * Removes this endboss from the world's enemy list.
 */
Endboss.prototype.removeFromEnemyList = function() {
    if (!this.world) return;
    this.world.level.enemies = this.world.level.enemies.filter(e => e !== this);
};


/**
 * Stops AI and animation intervals.
 */
Endboss.prototype.stopEndbossIntervals = function() {
    clearInterval(this.aiInterval);
    clearInterval(this.animationInterval);
};


/**
 * Initializes the timestamp when the dead animation is considered finished.
 */
Endboss.prototype.initDeadAnimTimer = function() {
    if (this.deadAnimEndAt) return;
    const now = performance.now();
    this.deadAnimEndAt = now + this.getDeadAnimDuration();
};


/**
 * Calculates the duration of the dead animation in milliseconds.
 * @returns {number}
 */
Endboss.prototype.getDeadAnimDuration = function() {
    const frames = this.IMAGES_DEAD?.length || 0;
    return frames * this.deadFrameMs + 80;
};


/**
 * Checks whether the dead animation duration has elapsed.
 * @returns {boolean}
 */
Endboss.prototype.isDeadAnimFinished = function() {
    if (!this.deadAnimEndAt) return false;
    return performance.now() >= this.deadAnimEndAt;
};


/**
 * Checks whether the endboss is currently in recovery time.
 * @param {number} now
 * @returns {boolean}
 */
Endboss.prototype.isInRecovery = function(now) {
    return now < this.recoverUntil;
};


/**
 * Applies recovery behavior (stops movement and ensures hurt animation if needed).
 */
Endboss.prototype.applyRecovery = function() {
    if (this.recoveryType === 'hurt') this.ensureHurtAnimation();
    this.stopMovementSoft();
};


/**
 * Ensures the hurt animation is active while recovering from hurt.
 */
Endboss.prototype.ensureHurtAnimation = function() {
    if (this.currentAnimation !== 'hurt') this.setAnimation('hurt');
};


/**
 * Softly reduces speed towards zero.
 */
Endboss.prototype.stopMovementSoft = function() {
    this.targetSpeed = 0;
    this.currentSpeed += (0 - this.currentSpeed) * 0.25;
};


/**
 * Main AI decision pipeline.
 * @param {number} now
 * @param {number} pepeX
 * @param {number} dist
 */
Endboss.prototype.updateAI = function(now, pepeX, dist) {
    if (this.exitRecoveryToAlert(now)) return;
    this.tryPlayScheduledEndbossAlertSound(now);
    this.updateAggro(dist);
    this.updatePatrol();
    this.updateChaseMovement(now, pepeX);
    this.updateChaseTransitions(now, pepeX, dist);
    this.tryStartAlert(now, pepeX, dist);
    this.updateAlertState(now, pepeX, dist);
    this.updateAttackState(now, pepeX);
};


/**
 * Exits hurt recovery into a short forced alert period.
 * @param {number} now
 * @returns {boolean}
 */
Endboss.prototype.exitRecoveryToAlert = function(now) {
    if (this.isInRecovery(now)) return false;
    if (this.recoveryType !== 'hurt') return false;
    this.recoveryType = null;
    this.setAnimation('alert');
    this.forceAlertUntil = Math.max(this.forceAlertUntil || 0, now + 350);
    return false;
};


/**
 * Updates aggro state and clears it if the target is too far.
 * @param {number} dist
 */
Endboss.prototype.updateAggro = function(dist) {
    if (!this.aggro) return;
    if (this.shouldLoseAggro(dist)) this.clearAggroState();
};


/**
 * Determines whether aggro should be lost.
 * @param {number} dist
 * @returns {boolean}
 */
Endboss.prototype.shouldLoseAggro = function(dist) {
    return dist > this.aggroKeepRange;
};


/**
 * Clears aggro and returns to patrol state.
 */
Endboss.prototype.clearAggroState = function() {
    this.aggro = false;
    this.stopChaseState();
    this.enterPatrolState(performance.now());
};


/**
 * Enters patrol state after alert/chase and applies patrol speed.
 * @param {number} now
 */
Endboss.prototype.enterPatrolState = function(now) {
    this.setAnimation('walk');
    this.postAlertCooldownUntil = now + 300;
    this.applyPatrolSpeedNow();
};


/**
 * Applies patrol speed immediately.
 */
Endboss.prototype.applyPatrolSpeedNow = function() {
    this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
    this.snapSpeedToTarget();
};


/**
 * Snaps current speed to the target speed.
 */
Endboss.prototype.snapSpeedToTarget = function() {
    this.currentSpeed = this.targetSpeed;
};


/**
 * Updates patrol movement and turns at patrol edges when applicable.
 */
Endboss.prototype.updatePatrol = function() {
    if (this.isChasing || this.aggro ||
        this.currentAnimation === 'alert' ||
        this.isAttackAnim()) return;
    this.targetSpeed = this.baseWalkSpeed * this.patrolDir;
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.12;
    this.turnAtPatrolEdges();
};