/**
 * Configures the walking sound loop and base volume.
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
 * Plays the snoring sound while sleeping (if allowed).
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
 * @returns {void}
 */
Character.prototype.stopPepeCalmBreathing = function () {
    const calmBreathing = this.world?.sounds?.pepeCalmBreathing;
    if (!calmBreathing) return;
    calmBreathing.pause();
    calmBreathing.currentTime = 0;
};