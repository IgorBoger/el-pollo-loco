/**
 * Applies horizontal motion based on current speed.
 */
Endboss.prototype.applyHorizontalMotion = function() {
    if (this.isAttackAnim() && this.hasHitInCurrentAttack) return;
    if (Math.abs(this.currentSpeed) < 0.05) return;
    this.x += this.currentSpeed;
};


/**
 * Updates the animation frames based on current state.
 */
Endboss.prototype.updateFrames = function() {
    const now = performance.now();
    const frame = this.getFrameConfig();
    this.applyWalkFrameOverride(frame);
    this.maybeAdvance(frame.images, now, frame.frameMs);
};


/**
 * Gets image list and frame duration for the current animation.
 * @returns {{images:string[], frameMs:number}}
 */
Endboss.prototype.getFrameConfig = function() {
    const frame = { images: this.IMAGES_WALKING, frameMs: this.walkFrameMs };
    if (this.currentAnimation === 'dead') return this.getDeadFrameConfig(frame);
    if (this.currentAnimation === 'hurt') return this.getHurtFrameConfig(frame);
    if (this.currentAnimation === 'alert') return this.getAlertFrameConfig(frame);
    if (this.isAttackAnim()) return this.getAttackFrameConfig(frame);
    return frame;
};


/**
 * Applies dead frame config.
 * @param {{images:string[], frameMs:number}} frame
 * @returns {{images:string[], frameMs:number}}
 */
Endboss.prototype.getDeadFrameConfig = function(frame) {
    frame.images = this.IMAGES_DEAD;
    frame.frameMs = 160;
    return frame;
};


/**
 * Applies hurt frame config.
 * @param {{images:string[], frameMs:number}} frame
 * @returns {{images:string[], frameMs:number}}
 */
Endboss.prototype.getHurtFrameConfig = function(frame) {
    frame.images = this.IMAGES_HURT;
    frame.frameMs = 120;
    return frame;
};


/**
 * Applies alert frame config.
 * @param {{images:string[], frameMs:number}} frame
 * @returns {{images:string[], frameMs:number}}
 */
Endboss.prototype.getAlertFrameConfig = function(frame) {
    frame.images = this.IMAGES_ALERT;
    frame.frameMs = this.alertFrameMs;
    return frame;
};


/**
 * Applies attack frame config.
 * @param {{images:string[], frameMs:number}} frame
 * @returns {{images:string[], frameMs:number}}
 */
Endboss.prototype.getAttackFrameConfig = function(frame) {
    frame.images = this.IMAGES_ATTACK;
    frame.frameMs = this.attackFrameMs;
    return frame;
};


/**
 * Ensures walking frame duration uses walkFrameMs.
 * @param {{images:string[], frameMs:number}} frame
 */
Endboss.prototype.applyWalkFrameOverride = function(frame) {
    if (frame.images === this.IMAGES_WALKING) {
        frame.frameMs = this.walkFrameMs;
    }
};


/**
 * Faces the boss to a target x-position.
 * @param {number} targetX
 */
Endboss.prototype.faceTo = function(targetX) {
    this.otherDirection = (targetX < this.x);
};


/**
 * Sets a new animation and resets frame counters.
 * @param {string} name
 * @returns {boolean} True if animation changed.
 */
Endboss.prototype.setAnimation = function(name) {
    if (this.isInRecovery(performance.now()) && name !== 'hurt') return false;
    if (this.currentAnimation === name) return false;
    this.currentAnimation = name;
    this.currentImage = 0;
    this.lastAnimAt = 0;
    return true;
};


/**
 * Sets a new animation without resetting the current frame index.
 * @param {string} name
 * @returns {boolean} True if animation changed.
 */
Endboss.prototype.setAnimationKeepFrame = function(name) {
    if (this.currentAnimation === name) return false;
    this.currentAnimation = name;
    return true;
};


/**
 * Advances animation when the frame duration elapsed.
 * @param {string[]} images
 * @param {number} now
 * @param {number} frameMs
 */
Endboss.prototype.maybeAdvance = function(images, now, frameMs) {
    if ((now - this.lastAnimAt) >= frameMs) {
        this.playAnimation(images);
        this.lastAnimAt = now;
    }
};


/**
 * Triggers a hurt flash reaction (sound, recovery and transition).
 */
Endboss.prototype.hurtFlash = function() {
    if (this.isDeadAnimation()) return;
    this.enterHurtFlashState();
    this.playEndbossHurtSound();
    const now = performance.now();
    this.applyHurtRecovery(now);
    this.stopChaseState();
    this.scheduleBackToAlert(now);
};


/**
 * Checks whether the boss is currently in the dead animation.
 * @returns {boolean}
 */
Endboss.prototype.isDeadAnimation = function() {
    return this.currentAnimation === 'dead';
};


/**
 * Initializes internal state for the hurt flash animation.
 */
Endboss.prototype.enterHurtFlashState = function() {
    this.isHurtLocked = true;
    this.currentAnimation = 'hurt';
    this.currentImage = 0;
    this.lastAnimAt = 0;
    this.recoveryType = 'hurt';
};


/**
 * Applies a short recovery window after getting hurt.
 * @param {number} now
 */
Endboss.prototype.applyHurtRecovery = function(now) {
    const until = now + 320;
    this.recoverUntil = Math.max(this.recoverUntil, until);
    this.postAlertCooldownUntil = Math.max(this.postAlertCooldownUntil, until);
};


/**
 * Schedules transition back to alert when recovery ends.
 * @param {number} now
 */
Endboss.prototype.scheduleBackToAlert = function(now) {
    const ms = Math.max(0, (this.recoverUntil || now) - now);
    setTimeout(() => {
        if (this.isDead()) return;
        if (performance.now() < (this.recoverUntil || 0)) return;
        this.isHurtLocked = false;
        this.setAnimation('alert');
    }, ms);
};


/**
 * Plays the hurt sound effect.
 */
Endboss.prototype.playEndbossHurtSound = function() {
    const endbossHurt = this.world?.sounds?.endbossHurt;
    if (!endbossHurt) return;
    endbossHurt.loop = false;
    endbossHurt.volume = 0.1;
    this.world.playEffectSound(endbossHurt);
};


/**
 * Plays the dead sound effect once.
 */
Endboss.prototype.playEndbossDeadSound = function() {
    if (this.deadSoundPlayed) return;
    const endbossDead = this.world?.sounds?.endbossDead;
    if (!endbossDead) return;
    endbossDead.loop = false;
    endbossDead.volume = 0.3;
    this.world.playEffectSound(endbossDead);
    this.deadSoundPlayed = true;
};


/**
 * Stuns the boss for a given duration.
 * @param {number} [ms=700]
 */
Endboss.prototype.stun = function(ms = 700) {
    const now = performance.now();
    this.enterHurtState(now, ms);
    this.scheduleBackToAlert(now);
};


/**
 * Enters hurt state, stops movement and sets recovery timers.
 * @param {number} now
 * @param {number} ms
 */
Endboss.prototype.enterHurtState = function(now, ms) {
    this.recoveryType = 'hurt';
    this.setAnimation('hurt');
    this.stopAttackState(now);
    this.stopChaseState();
    this.stopMovementHard();
    this.recoverUntil = now + ms;
    this.postAlertCooldownUntil = this.recoverUntil + 250;
};


/**
 * Stops attack-related state immediately.
 * @param {number} now
 */
Endboss.prototype.stopAttackState = function(now) {
    this.attackUntil = now;
    this.attackHitAllowedAt = 0;
    this.hasHitInCurrentAttack = true;
    this.currentAnimation = 'hurt';
};


/**
 * Clears chase state flags.
 */
Endboss.prototype.stopChaseState = function() {
    this.isChasing = false;
    this.chaseUntil = 0;
};


/**
 * Hard-stops movement values.
 */
Endboss.prototype.stopMovementHard = function() {
    this.currentSpeed = 0;
    this.targetSpeed = 0;
};