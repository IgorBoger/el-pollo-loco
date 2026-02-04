/**
 * Returns the background audio instance from the current world.
 *
 * @returns {Audio|null} The background audio object or null if not available.
 */
function getBackgroundAudio() {
    return world?.sounds?.background || null;
}


/**
 * Applies loop, volume and mute settings to the background audio.
 *
 * @param {Audio|null} backgroundAudio - The background audio instance.
 * @returns {void}
 */
function applyBackgroundSettings(backgroundAudio) {
    if (!backgroundAudio) return;
    backgroundAudio.loop = true;
    backgroundAudio.volume = getBackgroundBaseVolume();
    backgroundAudio.muted = isMusicMuted;
}


/**
 * Returns the base volume level for background music.
 *
 * @returns {number} The base background music volume.
 */
function getBackgroundBaseVolume() {
    return 0.1;
}


/**
 * Plays the background music if audio is available and the game state allows it.
 * Music will not play if muted or if the game is paused.
 *
 * @returns {void}
 */
function playBackgroundIfAllowed() {
    const backgroundAudio = getBackgroundAudio();
    applyBackgroundSettings(backgroundAudio);
    if (!backgroundAudio || isMusicMuted || isGamePaused) return;
    backgroundAudio.play();
}


/**
 * Toggles background music on or off.
 * Updates persisted settings and the music icon accordingly.
 *
 * @returns {void}
 */
function toggleMusic() {
    isMusicMuted = !isMusicMuted;
    setMusicMutedSetting(isMusicMuted);
    const icon = document.getElementById('musicIcon');
    if (icon) icon.src = isMusicMuted ? 'img/mute.png' : 'img/speaker.png';
    const bg = getBackgroundAudio();
    if (!bg) return;
    bg.muted = isMusicMuted;
    if (!isMusicMuted) playBackgroundIfAllowed();
    else bg.pause();
}


/**
 * Toggles sound effects on or off.
 * Updates persisted settings and applies the muted state to all effect sounds.
 *
 * @returns {void}
 */
function toggleSound() {
    isSoundMuted = !isSoundMuted;
    setSoundMutedSetting(isSoundMuted);
    const icon = document.getElementById('soundIcon');
    if (icon) icon.src = isSoundMuted ? 'img/mute.png' : 'img/speaker.png';
    if (!world || !world.sounds) return;
    for (const [name, sound] of Object.entries(world.sounds)) {
        if (name !== 'background' && sound instanceof Audio) {
            sound.muted = isSoundMuted;
        }
    }
}