function getBackgroundAudio() {
    return world?.sounds?.background || null;
}


function applyBackgroundSettings(backgroundAudio) {
    if (!backgroundAudio) return;
    backgroundAudio.loop = true;
    backgroundAudio.volume = getBackgroundBaseVolume();
    backgroundAudio.muted = isMusicMuted;
}


function getBackgroundBaseVolume() {
    return 0.1;
}


function playBackgroundIfAllowed() {
    const backgroundAudio = getBackgroundAudio();
    applyBackgroundSettings(backgroundAudio);
    if (!backgroundAudio || isMusicMuted || isGamePaused) return;
    backgroundAudio.play();
}


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