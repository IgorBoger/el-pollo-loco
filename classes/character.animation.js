/**
 * Starts the animation loop.
 *
 * @returns {void}
 */
Character.prototype.startAnimationLoop = function () {
    setInterval(() => this.tickAnimation(), 50);
};


/**
 * Runs one animation tick and selects the correct animation state.
 *
 * @returns {void}
 */
Character.prototype.tickAnimation = function () {
    if (isGamePaused || this.world.stopped) return;
    const now = performance.now();
    if (this.handleDeadAnimation(now)) return;
    if (this.handleHurtAnimation(now)) return;
    if (this.handleAirAnimation(now)) return;
    this.handleJumpReset();
    this.handleWalkOrIdle(now);
};


/**
 * Handles the dead animation state.
 *
 * @param {number} now
 * @returns {boolean} True if handled.
 */
Character.prototype.handleDeadAnimation = function (now) {
    if (!this.isDead()) return false;
    this.ensureAnimationState('dead');
    this.maybeAdvance(this.IMAGES_DEAD, now, this.deadFrameMs);
    this.img = this.imageCache[this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]];
    this.setDeadSound();
    return true;
};


/**
 * Handles the hurt animation state.
 *
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
 *
 * @param {number} now
 * @returns {boolean} True if handled.
 */
Character.prototype.handleAirAnimation = function () {
    if (!this.isAboveGround()) return false;
    this.currentAnimation = 'jump';
    this.updateJumpAnimation();
    this.hurtSoundPlayed = false;
    return true;
};


/**
 * Updates jump animation frame based on vertical speed.
 *
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
 *
 * @returns {void}
 */
Character.prototype.handleJumpReset = function () {
    if (!this.isJumping) return;
    this.img = this.imageCache[this.IMAGES_JUMPING[0]];
    this.isJumping = false;
};


/**
 * Handles walk animation or idle/sleep animation depending on input.
 *
 * @param {number} now
 * @returns {void}
 */
Character.prototype.handleWalkOrIdle = function (now) {
    if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
        this.ensureAnimationState('walk');
        this.maybeAdvance(this.IMAGES_WALKING, now, this.walkFrameMs);
        this.hurtSoundPlayed = false;
        return;
    }
    this.pepeIsSleeping(now);
    this.hurtSoundPlayed = false;
};


/**
 * Ensures the animation state is set and resets frame timer when changed.
 *
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
 * Configures the walking sound loop and base volume.
 *
 * @returns {void}
 */
Character.prototype.setupWalkSound = function () {
    const walkSound = this.world.sounds.pepeWalk;
    if (!walkSound) return;
    walkSound.loop = true;
    walkSound.volume = 0.7;
};


/**
 * Plays or pauses the walking sound depending on movement input.
 *
 * @returns {void}
 */
Character.prototype.handleWalkSound = function () {
    const walkSound = this.world.sounds.pepeWalk;
    if (!walkSound) return;
    if (this.world.keyBaord.RIGHT || this.world.keyBaord.LEFT) {
        if (walkSound.paused) this.world.playEffectSound(walkSound);
    } else {
        walkSound.pause();
    }
};


/**
 * Plays the hurt sound once when entering hurt state.
 *
 * @returns {void}
 */
Character.prototype.setHurtSound = function () {
    if (this.hurtSoundPlayed) return;
    const hurtSound = this.world?.sounds?.pepeHurt;
    if (!hurtSound) return;
    hurtSound.loop = false;
    hurtSound.volume = 0.2;
    this.world.playEffectSound(hurtSound);
    this.hurtSoundPlayed = true;
};


/**
 * Plays the dead sound once when entering dead state.
 *
 * @returns {void}
 */
Character.prototype.setDeadSound = function () {
    if (this.deadSoundPlayed) return;
    const deadSound = this.world?.sounds?.pepeDead;
    if (!deadSound) return;
    deadSound.loop = false;
    deadSound.volume = 0.3;
    this.world.playEffectSound(deadSound);
    this.deadSoundPlayed = true;
};


/**
 * Decides whether the character is sleeping or idling based on inactivity time.
 *
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
 *
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
 *
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
 *
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
 * Initializes the jump frame timer field.
 *
 * @returns {void}
 */
Character.prototype.initJumpFrameTimer = function () {
    if (!this.lastJumpFrameAt) this.lastJumpFrameAt = 0;
};


/**
 * Checks whether jump frame updates are throttled.
 *
 * @param {number} now
 * @returns {boolean}
 */
Character.prototype.isJumpFrameThrottled = function (now) {
    return now - this.lastJumpFrameAt < 120;
};


/**
 * Calculates the jump frame index based on vertical velocity.
 *
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
 *
 * @param {number} idx
 * @returns {void}
 */
Character.prototype.setJumpFrameImage = function (idx) {
    const path = this.IMAGES_JUMPING[idx];
    this.img = this.imageCache[path];
};


/**
 * Plays the snoring sound while sleeping (if allowed).
 *
 * @returns {void}
 */
Character.prototype.playPepeSnoring = function () {
    const pepeSnoring = this.world?.sounds?.pepeSnoring;
    if (!pepeSnoring || isSoundMuted || isGamePaused || this.world?.stopped) return;
    pepeSnoring.loop = true;
    pepeSnoring.volume = 0.8;
    pepeSnoring.currentTime = 0;
    this.world.playEffectSound(pepeSnoring);
};


/**
 * Stops the snoring sound.
 *
 * @returns {void}
 */
Character.prototype.stopPepeSnoring = function () {
    const pepeSnoring = this.world?.sounds?.pepeSnoring;
    if (!pepeSnoring) return;
    pepeSnoring.pause();
    pepeSnoring.currentTime = 0;
};


/**
 * Plays calm breathing sound during idle (if allowed).
 *
 * @returns {void}
 */
Character.prototype.playPepeCalmBreating = function () {
    const calmBreathing = this.world?.sounds?.pepeCalmBreathing;
    if (!calmBreathing || !calmBreathing.paused || isSoundMuted) return;
    calmBreathing.loop = true;
    calmBreathing.volume = 0.4;
    this.world.playEffectSound(calmBreathing);
};


/**
 * Stops calm breathing sound.
 *
 * @returns {void}
 */
Character.prototype.stopPepeCalmBreathing = function () {
    const calmBreathing = this.world?.sounds?.pepeCalmBreathing;
    if (!calmBreathing) return;
    calmBreathing.pause();
    calmBreathing.currentTime = 0;
};