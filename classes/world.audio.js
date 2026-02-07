/**
 * Stops all active endboss action sounds.
 */
World.prototype.stopEndbossActionSounds = function () {
    const sounds = [this.sounds.endbossAppear, this.sounds.endbossAlert, this.sounds.endbossAttack];
    sounds.forEach(s => this.stopSound(s));
}


/**
 * Stops and resets a sound.
 * @param {Audio} sound
 */
World.prototype.stopSound = function (sound) {
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
}


/**
 * Plays a sound effect with background ducking.
 * @param {Audio} sound
 */
World.prototype.playEffectSound = function (sound) {
    if (!this.canPlaySound(sound)) return;
    this.duckBackground();
    this.tryRestartAndPlaySound(sound);
}


/**
 * Determines whether a sound is allowed to play.
 * @param {Audio} sound
 * @returns {boolean}
 */
World.prototype.canPlaySound = function (sound) {
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
World.prototype.isBackgroundSound = function (sound) {
    return sound === this.sounds?.background;
}


/**
* Returns whether playback should be muted depending on sound type.
* Uses global mute flags for music and sound effects.
* @param {boolean} backgroundSounds - True if the requested sound is background music.
* @returns {boolean} True if the sound type is currently muted.
*/
World.prototype.isMutedForSoundType = function (backgroundSounds) {
    if (backgroundSounds) return isMusicMuted;
    return isSoundMuted;
}


/**
 * Restarts and plays a sound with error handling.
 * @param {Audio} sound
 */
World.prototype.tryRestartAndPlaySound = function (sound) {
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
World.prototype.restartSound = function (sound) {
    sound.pause();
    sound.currentTime = 0;
}


/**
 * Handles play promise rejections.
 * @param {*} sound
 */
World.prototype.playSoundWithPromiseHandling = function (sound) {
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
World.prototype.duckBackground = function () {
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
World.prototype.setBackgroundVolume = function (vol) {
    const bg = this.sounds?.background;
    if (!bg) return;
    bg.volume = vol;
}


/**
 * Pauses all sounds.
 */
World.prototype.pauseAllSounds = function () {
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
World.prototype.initCollectables = function (array, ClassRef, offsetMinX = 200, offsetMaxX = 50) {
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
 * Stops and resets all sounds.
 */
World.prototype.resetAllSounds = function () {
    Object.values(this.sounds).forEach(sound => {
        if (!(sound instanceof Audio)) return;
        sound.pause();
        sound.currentTime = 0;
    });
}