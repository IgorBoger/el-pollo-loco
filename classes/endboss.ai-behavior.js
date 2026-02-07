/**
 * Turns at patrol boundaries based on direction and position.
 */
Endboss.prototype.turnAtPatrolEdges = function() {
    if (this.shouldTurnLeftEdge()) return this.turnToRight();
    if (this.shouldTurnRightEdge()) return this.turnToLeft();
};


/**
 * Checks if the endboss should turn at the left patrol edge.
 * @returns {boolean}
 */
Endboss.prototype.shouldTurnLeftEdge = function() {
    return this.patrolDir < 0 && this.x <= this.patrolLeft;
};


/**
 * Checks if the endboss should turn at the right patrol edge.
 * @returns {boolean}
 */
Endboss.prototype.shouldTurnRightEdge = function() {
    return this.patrolDir > 0 && this.x >= this.patrolRight;
};


/**
 * Turns movement to the right and dampens speed.
 */
Endboss.prototype.turnToRight = function() {
    this.x = this.patrolLeft;
    this.patrolDir = 1;
    this.currentSpeed = Math.abs(this.currentSpeed) * 0.85;
};


/**
 * Turns movement to the left and dampens speed.
 */
Endboss.prototype.turnToLeft = function() {
    this.x = this.patrolRight;
    this.patrolDir = -1;
    this.currentSpeed = -Math.abs(this.currentSpeed) * 0.85;
};


/**
 * Updates chasing movement towards the character.
 * @param {number} now
 * @param {number} pepeX
 */
Endboss.prototype.updateChaseMovement = function(now, pepeX) {
    if (!this.isChasing || this.isAttackAnim()) return;
    const dir = pepeX > this.x ? 1 : -1;
    this.targetSpeed = this.chaseSpeed * dir;
    this.otherDirection = pepeX > this.x;
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.18;
};


/**
 * Handles chase transitions (attack, back to patrol).
 * @param {number} now
 * @param {number} pepeX
 * @param {number} dist
 */
Endboss.prototype.updateChaseTransitions = function(now, pepeX, dist) {
    if (!this.isChasing || this.isAttackAnim()) return;
    if (dist <= this.attackRange) { this.startAttack(now, pepeX); return; }
    if (dist <= this.alertRange) return;
    this.stopChaseState();
    this.enterPatrolState(now);
};


/**
 * Starts an attack sequence if allowed.
 * @param {number} now
 * @param {number} pepeX
 */
Endboss.prototype.startAttack = function(now, pepeX) {
    if (this.shouldSkipAttackStart(now)) return;
    this.prepareAttackStart(now);
    const dir = this.getAttackDirection(pepeX);
    this.applyAttackDirection(pepeX, dir);
    this.setupAttackSpeeds(dir);
    this.setupAttackHitWindow(now);
    this.resetAttackHitFlag();
};


/**
 * Checks whether attack start should be skipped.
 * @param {number} now
 * @returns {boolean}
 */
Endboss.prototype.shouldSkipAttackStart = function(now) {
    if (this.isAttackAnim()) return true;
    if (this.isInRecovery(now)) return true;
    if (now < this.postAlertCooldownUntil) return true;
    if (now < (this.forceAlertUntil || 0)) return true;
    return this.currentAnimation === 'hurt';
};


/**
 * Prepares attack state and sets attack end time.
 * @param {number} now
 */
Endboss.prototype.prepareAttackStart = function(now) {
    this.stopChaseState();
    const changedToAttack = this.setAnimation('attackPrep');
    if (changedToAttack) this.playEndbossAttackSound();
    this.attackUntil = now + this.attackDurationMs;
};


/**
 * Determines attack direction relative to the character.
 * @param {number} pepeX
 * @returns {number}
 */
Endboss.prototype.getAttackDirection = function(pepeX) {
    return pepeX > this.x ? 1 : -1;
};


/**
 * Applies attack direction flags.
 * @param {number} pepeX
 * @param {number} dir
 */
Endboss.prototype.applyAttackDirection = function(pepeX, dir) {
    this.attackDir = dir;
    this.otherDirection = pepeX > this.x;
};


/**
 * Sets up initial attack speed values.
 * @param {number} dir
 */
Endboss.prototype.setupAttackSpeeds = function(dir) {
    this.currentSpeed = 0;
    this.targetSpeed = this.attackDashSpeed * dir;
};


/**
 * Sets up the time window when attack damage is allowed.
 * @param {number} now
 */
Endboss.prototype.setupAttackHitWindow = function(now) {
    this.attackHitAllowedAt = now + this.attackHitDelayMs;
};


/**
 * Resets the hit flag for the current attack.
 */
Endboss.prototype.resetAttackHitFlag = function() {
    this.hasHitInCurrentAttack = false;
};


/**
 * Tries to start alert state when the character is in range.
 * @param {number} now
 * @param {number} pepeX
 * @param {number} dist
 */
Endboss.prototype.tryStartAlert = function(now, pepeX, dist) {
    const inCd = this.isInRecovery(now) || now < this.postAlertCooldownUntil;
    if (inCd || this.isHurt?.() || this.isChasing) return;
    if (this.currentAnimation === 'alert' || this.isAttackAnim()) return;
    if (dist > this.alertRange) return;
    this.facePepe(pepeX);
    this.freezeForAlert();
    const changedToAlert = this.setAnimation('alert');
    if (!changedToAlert) return;
    this.aggro = true;
    this.handleAlertSounds(now);
    this.alertUntil = now + this.alertFrameMs * this.IMAGES_ALERT.length + 60;
    this.forceAlertUntil = Math.max(this.forceAlertUntil || 0, now + 300);
};


/**
 * Faces the character and aligns patrol direction.
 * @param {number} pepeX
 */
Endboss.prototype.facePepe = function(pepeX) {
    this.otherDirection = pepeX > this.x;
    this.syncPatrolDirToFacing();
};


/**
 * Syncs patrol direction based on facing direction.
 */
Endboss.prototype.syncPatrolDirToFacing = function() {
    this.patrolDir = this.otherDirection ? 1 : -1;
};


/**
 * Freezes movement for the alert animation.
 */
Endboss.prototype.freezeForAlert = function() {
    this.targetSpeed = 0;
    this.currentSpeed = 0;
    this.facing = this.otherDirection ? 1 : -1;
};


/**
 * Handles alert-related sound effects.
 * @param {number} now
 */
Endboss.prototype.handleAlertSounds = function(now) {
    const isFirstEncounter = !this.appearSoundPlayed;
    if (isFirstEncounter) {
        this.playEndbossAppearSound();
        this.scheduleEndbossAlertSound(now);
        return;
    }
    this.playEndbossAlertSound(now);
};


/**
 * Plays the appear sound once.
 */
Endboss.prototype.playEndbossAppearSound = function() {
    if (this.appearSoundPlayed) return;
    const endbossAppear = this.world?.sounds?.endbossAppear;
    if (!endbossAppear) return;
    endbossAppear.loop = false;
    endbossAppear.volume = 0.2;
    this.world.playEffectSound(endbossAppear);
    this.appearSoundPlayed = true;
};


/**
 * Plays the alert sound with a cooldown.
 * @param {number} now
 */
Endboss.prototype.playEndbossAlertSound = function(now) {
    if (now < this.alertSoundCooldownUntil) return;
    const endbossAlert = this.world?.sounds?.endbossAlert;
    if (!endbossAlert) return;
    endbossAlert.loop = false;
    endbossAlert.volume = 0.1;
    this.world.playEffectSound(endbossAlert);
    this.alertSoundCooldownUntil = now + this.alertSoundCooldownMs;
};


/**
 * Schedules playing the alert sound after the appear sound.
 * @param {number} now
 */
Endboss.prototype.scheduleEndbossAlertSound = function(now) {
    this.scheduledAlertSoundAt = now + this.appearToAlertDelayMs;
};


/**
 * Plays a scheduled alert sound if its time has come.
 * @param {number} now
 */
Endboss.prototype.tryPlayScheduledEndbossAlertSound = function(now) {
    if (!this.scheduledAlertSoundAt) return;
    if (now < this.scheduledAlertSoundAt) return;
    this.scheduledAlertSoundAt = 0;
    this.playEndbossAlertSound(now);
};


/**
 * Plays the attack sound effect.
 */
Endboss.prototype.playEndbossAttackSound = function() {
    const endbossAttack = this.world?.sounds?.endbossAttack;
    if (!endbossAttack) return;
    endbossAttack.loop = false;
    endbossAttack.volume = 0.1;
    this.world.playEffectSound(endbossAttack);
};


/**
 * Stops all loops and clears scheduled sound triggers.
 */
Endboss.prototype.stop = function() {
    if (this.aiInterval) clearInterval(this.aiInterval);
    if (this.animationInterval) clearInterval(this.animationInterval);
    this.aiInterval = null;
    this.animationInterval = null;
    this.scheduledAlertSoundAt = 0;
};


/**
 * Updates alert state and transitions to chase/attack when appropriate.
 * @param {number} now
 * @param {number} pepeX
 * @param {number} dist
 */
Endboss.prototype.updateAlertState = function(now, pepeX, dist) {
    if (!this.isInAlertAnimation()) return;
    this.applyAlertFacing(pepeX);
    this.stopAlertMotion();
    if (this.shouldStayInAlert(now)) return;
    if (this.shouldAttackFromAlert(dist)) return this.startAttack(now, pepeX);
    this.transitionAlertToChase(now, pepeX);
};