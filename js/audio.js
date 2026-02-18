/**
 * Returns the background audio instance from the current world.
 * @returns {Audio|null} The background audio object or null if not available.
 */
function getBackgroundAudio() {
    return world?.sounds?.background || null;
}


/**
 * Applies loop, volume and mute settings to the background audio.
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
 * @returns {number} The base background music volume.
 */
function getBackgroundBaseVolume() {
    return 0.1;
}


/**
 * Plays the background music if audio is available and the game state allows it.
 * Music will not play if muted or if the game is paused.
 * @returns {void}
 */
function playBackgroundIfAllowed() {
    const backgroundAudio = getBackgroundAudio();
    applyBackgroundSettings(backgroundAudio);
    if (!backgroundAudio || isMusicMuted || isGamePaused) return;
    // backgroundAudio.play();
    safePlayAudio(backgroundAudio);
}


/**
 * Plays an audio element safely and ignores AbortError.
 * @param {Audio} audio
 * @returns {void}
 */
function safePlayAudio(audio) {
    const promise = audio.play();
    if (!promise?.catch) return;
    promise.catch((e) => {
        if (e?.name === 'AbortError') return;
        console.warn('Audio play failed:', e);
    });
}


/**
 * Pauses an audio element safely.
 * @param {Audio} audio
 * @returns {void}
 */
function safePauseAudio(audio) {
    try { audio.pause(); }
    catch (e) { /* ignore */ }
}


/**
 * Toggles background music on or off.
 * Updates persisted settings and the music icon accordingly.
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
    // if (!isMusicMuted) playBackgroundIfAllowed();
    // else bg.pause();
    if (!isMusicMuted) safePlayAudio(bg);
    else safePauseAudio(bg);
}


/**
 * Toggles sound effects on or off.
 * Updates persisted settings and applies the muted state to all effect sounds.
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


/**
 * Initializes the audio HUD buttons inside the game view.
 * @returns {void}
 */
function initAudioHud() {
    showAudioHud();
    bindAudioHudButtons();
    syncAudioHudIcons();
}


/**
 * Shows the audio HUD.
 * @returns {void}
 */
function showAudioHud() {
    const hud = document.getElementById('audioHud');
    hud?.classList.remove('d-none');
    hud?.classList.add('d-flex');
}


/**
 * Hides the audio HUD.
 * @returns {void}
 */
function hideAudioHud() {
    const hud = document.getElementById('audioHud');
    hud?.classList.add('d-none');
    hud?.classList.remove('d-flex');
}


/**
 * Binds click events for HUD buttons.
 * @returns {void}
 */
function bindAudioHudButtons() {
    const musicBtn = document.getElementById('musicToggleHud');
    const soundBtn = document.getElementById('soundToggleHud');
    musicBtn?.addEventListener('click', () => onMusicHudClick());
    soundBtn?.addEventListener('click', () => onSoundHudClick());
}


/**
 * Handles music HUD button click.
 * @returns {void}
 */
function onMusicHudClick() {
    triggerSettingsMusicToggle();
    syncAudioHudIcons();
}


/**
 * Handles sound HUD button click.
 * @returns {void}
 */
function onSoundHudClick() {
    triggerSettingsSoundToggle();
    syncAudioHudIcons();
}


/**
 * Triggers existing settings music toggle button.
 * @returns {void}
 */
function triggerSettingsMusicToggle() {
    document.getElementById('musicToggle')?.click();
}


/**
 * Triggers existing settings sound toggle button.
 * @returns {void}
 */
function triggerSettingsSoundToggle() {
    document.getElementById('soundToggle')?.click();
}


/**
 * Syncs HUD icons with current settings icons (single source of truth).
 * @returns {void}
 */
function syncAudioHudIcons() {
    copyIconSrc('musicIcon', 'musicIconHud');
    copyIconSrc('soundIcon', 'soundIconHud');
}


/**
 * Copies image src from one icon to another.
 * @param {string} sourceId
 * @param {string} targetId
 * @returns {void}
 */
function copyIconSrc(sourceId, targetId) {
    const srcEl = document.getElementById(sourceId);
    const tgtEl = document.getElementById(targetId);
    if (!srcEl || !tgtEl) return;
    tgtEl.src = srcEl.src;
}