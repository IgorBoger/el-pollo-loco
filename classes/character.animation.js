/**
 * Starts the animation loop.
 * @returns {void}
 */
Character.prototype.startAnimationLoop = function () {
    setInterval(() => this.tickAnimation(), 50);
};


/**
 * Runs one animation tick and selects the correct animation state.
 * @returns {void}
 */
Character.prototype.tickAnimation = function () {
    if (isGamePaused || this.world.stopped) return;
    if (this.world?.isControlsLocked?.()) this.stopWalkSoundIfPlaying();
    const now = performance.now();
    if (this.handleDeadAnimation(now)) return;
    if (this.handleHurtAnimation(now)) return;
    if (this.handleAirAnimation(now)) return;
    this.handleJumpReset();
    this.handleWalkOrIdle(now);
};


/**
 * Stops the walking sound immediately (used for control lock on win).
 * @returns {void}
 */
Character.prototype.stopWalkSoundIfPlaying = function () {
    const walkSound = this.world?.sounds?.pepeWalk;
    if (!walkSound) return;
    walkSound.pause();
};


/**
 * Handles the dead animation state.
 * @param {number} now
 * @returns {boolean} True if handled.
 */
Character.prototype.handleDeadAnimation = function (now) {
    if (!this.isDead()) return false;
    const changed = this.currentAnimation !== 'dead';
    this.ensureAnimationState('dead');
    if (changed) this.initDeadAnimTimer();
    this.maybeAdvanceOnce(this.IMAGES_DEAD, now, this.deadFrameMs);
    this.setDeadSound();
    return true;
};


/**
 * Initializes the timestamp when the dead animation is considered finished.
 * @returns {void}
 */
Character.prototype.initDeadAnimTimer = function () {
    if (this.deadAnimEndAt) return;
    const now = performance.now();
    this.deadAnimEndAt = now + this.getDeadAnimDuration();
};


/**
 * Calculates the duration of the dead animation in ms.
 * @returns {number}
 */
Character.prototype.getDeadAnimDuration = function () {
    const frames = this.IMAGES_DEAD?.length || 0;
    return frames * this.deadFrameMs + 80;
};


/**
 * Checks whether the dead animation duration has elapsed.
 * @returns {boolean}
 */
Character.prototype.isDeadAnimFinished = function () {
    if (!this.deadAnimEndAt) return false;
    return performance.now() >= this.deadAnimEndAt;
};


/**
 * Handles the hurt animation state.
 * @param {number} now
 * @returns {boolean} True if handled.
 */
Character.prototype.handleHurtAnimation = function (now) {
    if (!this.isHurt()) return false;
    this.ensureAnimationState('hurt');
    this.maybeAdvance(this.IMAGES_HURT, now, this.hurtFrameMs);
    this.setHurtSound();
    return true;
};


/**
 * Handles in-air animation state.
 * @param {number} now
 * @returns {boolean} True if handled.
 */
Character.prototype.handleAirAnimation = function (now) {
    if (this.isAirAnimationSuppressed(now)) return false;
    if (!this.isAboveGround()) return false;
    this.currentAnimation = 'jump';
    this.updateJumpAnimation();
    this.hurtSoundPlayed = false;
    return true;
};


/**
 * Suppresses air/jump animation for a short time window.
 * @param {number} now
 * @returns {boolean}
 */
Character.prototype.isAirAnimationSuppressed = function (now) {
    return now < (this.airAnimationSuppressedUntil || 0);
};


/**
 * Suppresses air/jump animation for ms.
 * @param {number} ms
 * @returns {void}
 */
Character.prototype.suppressAirAnimation = function (ms) {
    this.airAnimationSuppressedUntil = performance.now() + ms;
};


/**
 * Updates jump animation frame based on vertical speed.
 * @returns {void}
 */
Character.prototype.updateJumpAnimation = function () {
    this.initJumpFrameTimer();
    const now = performance.now();
    if (this.isJumpFrameThrottled(now)) return;
    this.lastJumpFrameAt = now;
    const idx = this.getJumpFrameIndex(this.speedY);
    this.setJumpFrameImage(idx);
};


/**
 * Resets jump flag once the character is no longer in jump animation.
 * @returns {void}
 */
Character.prototype.handleJumpReset = function () {
    if (!this.isJumping) return;
    this.img = this.imageCache[this.IMAGES_JUMPING[0]];
    this.isJumping = false;
};


/**
 * Handles walk animation or idle/sleep animation depending on input.
 * @param {number} now
 * @returns {void}
 */
Character.prototype.handleWalkOrIdle = function (now) {
    if (this.shouldForceIdle()) return this.playLockedIdle();
    if (this.isMovementPressed()) return this.playWalkAnimation(now);
    this.playIdleOrSleep(now);
};


/**
 * Returns whether the character should be forced into idle (win/lose freeze).
 * @returns {boolean}
 */
Character.prototype.shouldForceIdle = function () {
    return !!this.world?.isControlsLocked?.();
};


/**
 * Plays idle animation for locked controls.
 * @returns {void}
 */
Character.prototype.playLockedIdle = function () {
    this.playAnimation(this.IMAGES_IDLE);
};


/**
 * Checks whether left/right movement input is currently pressed.
 * @returns {boolean}
 */
Character.prototype.isMovementPressed = function () {
    return !!(this.world?.keyBaord?.RIGHT || this.world?.keyBaord?.LEFT);
};


/**
 * Plays walking animation and resets hurt sound flag.
 * @param {number} now
 * @returns {void}
 */
Character.prototype.playWalkAnimation = function (now) {
    this.ensureAnimationState('walk');
    this.maybeAdvance(this.IMAGES_WALKING, now, this.walkFrameMs);
    this.hurtSoundPlayed = false;
};


/**
 * Plays idle/sleep behavior and resets hurt sound flag.
 * @param {number} now
 * @returns {void}
 */
Character.prototype.playIdleOrSleep = function (now) {
    this.pepeIsSleeping(now);
    this.hurtSoundPlayed = false;
};


/**
 * Ensures the animation state is set and resets frame timer when changed.
 * @param {string} name
 * @returns {void}
 */
Character.prototype.ensureAnimationState = function (name) {
    if (this.currentAnimation === name) return;
    this.currentAnimation = name;
    this.currentImage = 0;
    this.lastAnimAt = 0;
};


/**
 * Decides whether the character is sleeping or idling based on inactivity time.
 * @param {number} now
 * @returns {void}
 */
Character.prototype.pepeIsSleeping = function (now) {
    const isSleeping = (now - this.lastActivityAt) >= this.idleTimeoutMs;
    if (isSleeping) this.sleeping(now);
    else this.idle(now);
};


/**
 * Executes sleeping animation and plays snoring sound when needed.
 * @param {number} now
 * @returns {void}
 */
Character.prototype.sleeping = function (now) {
    this.stopPepeCalmBreathing?.();
    if (this.currentAnimation !== 'sleep') {
        this.currentAnimation = 'sleep';
        this.currentImage = 0;
        this.lastAnimAt = 0;
        this.playPepeSnoring();
    }
    this.maybeAdvance(this.IMAGES_LONG_IDLE, now, this.sleepFrameMs);
};


/**
 * Executes idle animation and plays calm breathing sound when needed.
 * @param {number} now
 * @returns {void}
 */
Character.prototype.idle = function (now) {
    if (this.currentAnimation !== 'idle') {
        this.currentAnimation = 'idle';
        this.currentImage = 0;
        this.lastAnimAt = 0;
    }
    this.maybeAdvance(this.IMAGES_IDLE, now, this.idleFrameMs);
    this.playPepeCalmBreating();
};


/**
 * Advances the animation frames when the configured frame time is reached.
 * @param {string[]} images
 * @param {number} now
 * @param {number} frameMs
 * @returns {void}
 */
Character.prototype.maybeAdvance = function (images, now, frameMs) {
    if ((now - this.lastAnimAt) >= frameMs) {
        this.playAnimation(images);
        this.lastAnimAt = now;
    }
};


/**
 * Plays an animation once and keeps the last frame.
 * @param {string[]} images
 * @returns {void}
 */
Character.prototype.playAnimationOnce = function (images) {
    const lastIdx = images.length - 1;
    const idx = Math.min(this.currentImage, lastIdx);
    const path = images[idx];
    this.img = this.imageCache[path];

    if (this.currentImage < lastIdx) this.currentImage++;
};


/**
 * Advances an animation only once (stops on last frame).
 * @param {string[]} images
 * @param {number} now
 * @param {number} frameMs
 * @returns {void}
 */
Character.prototype.maybeAdvanceOnce = function (images, now, frameMs) {
    if ((now - this.lastAnimAt) < frameMs) return;
    this.playAnimationOnce(images);
    this.lastAnimAt = now;
};


/**
 * Initializes the jump frame timer field.
 * @returns {void}
 */
Character.prototype.initJumpFrameTimer = function () {
    if (!this.lastJumpFrameAt) this.lastJumpFrameAt = 0;
};


/**
 * Checks whether jump frame updates are throttled.
 * @param {number} now
 * @returns {boolean}
 */
Character.prototype.isJumpFrameThrottled = function (now) {
    return now - this.lastJumpFrameAt < 120;
};


/**
 * Calculates the jump frame index based on vertical velocity.
 * @param {number} vy
 * @returns {number}
 */
Character.prototype.getJumpFrameIndex = function (vy) {
    const up_fast = 0, up_mid = 2, up_slow = 3, apex = 4;
    const down_slow = 5, down_mid = 6, down_fast = 8;
    if (vy > 12) return up_fast;
    if (vy > 6) return up_mid;
    if (vy > 2) return up_slow;
    if (vy > -2) return apex;
    if (vy > -8) return down_slow;
    if (vy > -14) return down_mid;
    return down_fast;
};


/**
 * Sets the current jump frame image by index.
 * @param {number} idx
 * @returns {void}
 */
Character.prototype.setJumpFrameImage = function (idx) {
    const path = this.IMAGES_JUMPING[idx];
    this.img = this.imageCache[path];
};