function getBackgroundAudio() {
    return world?.sounds?.background || null;
}


function applyBackgroundSettings(backgroundAudio) {
    if (!backgroundAudio) return;
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0.1;
    backgroundAudio.muted = isMusicMuted;
}


function playBackgroundIfAllowed() {
    const backgroundAudio = getBackgroundAudio();
    applyBackgroundSettings(backgroundAudio);
    if (!backgroundAudio || isMusicMuted || isGamePaused) return;
    backgroundAudio.play();
}


function toggleMusic() {
    isMusicMuted = !isMusicMuted;
    // localStorage.setItem('isMusicMuted', isMusicMuted);
    setMusicMutedSetting(isMusicMuted);
    const icon = document.getElementById('musicIcon');
    if (icon) icon.src = isMusicMuted ? 'img/mute.png' : 'img/speaker.png';
    const bg = world?.sounds?.background;
    if (bg) {
        bg.muted = isMusicMuted;
        if (!isMusicMuted) {
            bg.play().catch((e) => console.warn('Musik konnte nicht gestartet werden:', e));
        } else {
            bg.pause();
            bg.currentTime = 0;
        }
    }
}


function toggleSound() {
    isSoundMuted = !isSoundMuted;
    // localStorage.setItem('isSoundMuted', isSoundMuted);
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