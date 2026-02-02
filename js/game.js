let canvas;
let world;
let keyBaord = new KeyBaord();
const buttons = [
    { id: 'btnLeft', key: 'LEFT' },
    { id: 'btnRight', key: 'RIGHT' },
    { id: 'btnJump', key: 'SPACE' },
    { id: 'btnThrow', key: 'THROW' }
];
let _viewportRaf = null;
let isMusicMuted = !!getSetting('isMusicMuted');
let isSoundMuted = !!getSetting('isSoundMuted');
let currentLanguage = getSetting('language') || 'ES';
var isGamePaused = false;
window.isGamePaused = isGamePaused;
let gameStartAt = 0;
const LEADERBOARD_KEY = 'leaderboard';
window.debugHitboxes = false;


function init() {
    canvas = document.getElementById('canvas');
    setupHiDPICanvas();
    world = new World(canvas, keyBaord);
    Object.entries(world.sounds).forEach(([name, sound]) => {
        if (sound instanceof Audio) {
            if (name === 'background') {
                sound.muted = isMusicMuted;
            } else {
                sound.muted = isSoundMuted;
            }
        }
    });
}


function startGame() {
    setGamePausedState(false);
    gameStartAt = Date.now();
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.classList.remove('d-none');
    updatePauseButtonUi();
    document.getElementById('startScreen').classList.add('d-none');
    init();
    playBackgroundIfAllowed();
}


function setGamePausedState(state) {
    isGamePaused = state;
    window.isGamePaused = state;
}


function restartGame() {
    closeBurgerMenu();
    document.getElementById('pauseBtn')?.classList.add('d-none');
    destroyWorldIfExists();
    showStartScreen();
}


function showStartScreen() {
    document.getElementById('startScreen')?.classList.remove('d-none');
}


function restartGameCore() {
    if (world && typeof world.destroy === "function") world.destroy();
    document.getElementById('startScreen').classList.remove('d-none');
}


function onLangOptionClick(e) {
    const lang = getLangFromClick(e);
    if (!lang) return;
    applyLanguageChange(lang);
    closeLangModal();
}


function getLangFromClick(e) {
    const btn = e.target.closest('.lang-opt');
    return btn?.getAttribute('data-lang');
}


function applyLanguageChange(lang) {
    if (typeof setLanguage === 'function') return setLanguage(lang);
    setLanguageFallback(lang);
}


function setLanguageFallback(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', currentLanguage);
    applyTranslations?.();
}


function togglePause() {
    if (!world) return;
    setGamePausedState(!window.isGamePaused);
    const btn = document.getElementById('pauseBtn');
    updatePauseButtonUi();
    if (isGamePaused) {
        world.pauseAllSounds();
        return;
    }
    if (world.character) world.character.lastActivityAt = performance.now();
    playBackgroundIfAllowed();
}


function updatePauseButtonUi() {
    const btn = document.getElementById('pauseBtn');
    if (!btn) return;
    const img = btn.querySelector('img');
    if (!img) return;
    img.src = window.isGamePaused ? 'img/play.png' : 'img/pause.png';
    img.alt = window.isGamePaused ? 'Play' : 'Pause';
}


function quickRestartGame() {
    setGamePausedState(false);
    showPauseButton();
    updatePauseButtonUi();
    hideStartScreen();
    destroyWorldIfExists();
    ensureCanvasReady();
    createNewWorld();
    playBackgroundIfAllowed();
    handleViewportChange?.();
}


function showPauseButton() {
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.remove('d-none');
}


function hideStartScreen() {
    document.getElementById('startScreen')?.classList.add('d-none');
}


function destroyWorldIfExists() {
    if (!world || typeof world.destroy !== 'function') return;
    world.destroy();
}


function ensureCanvasReady() {
    if (canvas) return;
    canvas = document.getElementById('canvas');
    setupHiDPICanvas();
}


function createNewWorld() {
    world = new World(canvas, keyBaord);
}


function onGameOver(worldInstance) {
    setGamePausedState(true);
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.add('d-none');
    worldInstance?.pauseAllSounds();
    addLeaderboardEntry(worldInstance, 'lose');
    openGameOverOverlay();
}


function onWin(worldInstance) {
    setGamePausedState(true);
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.add('d-none');
    worldInstance?.pauseAllSounds?.();
    addLeaderboardEntry(worldInstance, 'win');
    openWinOverlay();
}