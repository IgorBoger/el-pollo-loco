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
let isMusicMuted = localStorage.getItem('isMusicMuted') === 'true';
let isSoundMuted = localStorage.getItem('isSoundMuted') === 'true';
let currentLanguage = localStorage.getItem('language') || 'ES';
var isGamePaused = false;
let gameStartAt = 0;
const LEADERBOARD_KEY = 'leaderboard';


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
    isGamePaused = false;
    gameStartAt = Date.now();
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.classList.remove('d-none');
    setPauseButtonLabel(I18N[currentLanguage] || I18N.ES);
    document.getElementById('startScreen').classList.add('d-none');
    init();
    playBackgroundIfAllowed();
}


function restartGame() {
    closeBurgerMenu();
    document.getElementById('pauseBtn')?.classList.add('d-none');
    document.getElementById('gameOverOverlay')?.classList.add('d-none');
    document.getElementById('gameOverOverlay')?.classList.remove('d-flex');
    if (world && typeof world.destroy === "function") {
        world.destroy();
    }
    document.getElementById('startScreen').classList.remove('d-none');
}


function onLangOptionClick(e) {
    const btn = e.target.closest('.lang-opt');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    if (!lang) return;
    if (typeof setLanguage === 'function') setLanguage(lang);
    else {
        currentLanguage = lang;
        localStorage.setItem('language', currentLanguage);
        if (typeof applyTranslations === 'function') applyTranslations();
        const langBtn = document.getElementById('langToggle');
        if (langBtn) langBtn.textContent = currentLanguage;
    }
    closeLangModal();
}


function togglePause() {
    if (!world) return;
    isGamePaused = !isGamePaused;
    const btn = document.getElementById('pauseBtn');
    setPauseButtonLabel(I18N[currentLanguage] || I18N.ES);
    if (isGamePaused) {
        world.pauseAllSounds();
        return;
    }
    if (world.character) world.character.lastActivityAt = performance.now();
    playBackgroundIfAllowed();
}


function quickRestartGame() {
    isGamePaused = false;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.remove('d-none');
    setPauseButtonLabel(I18N[currentLanguage] || I18N.ES);
    document.getElementById('startScreen')?.classList.add('d-none');
    document.getElementById('gameOverOverlay')?.classList.add('d-none');
    document.getElementById('gameOverOverlay')?.classList.remove('d-flex');
    if (world && typeof world.destroy === 'function') {
        world.destroy();
    }
    if (!canvas) {
        canvas = document.getElementById('canvas');
        setupHiDPICanvas();
    }
    world = new World(canvas, keyBaord);
    playBackgroundIfAllowed();
    handleViewportChange?.();
}


function onGameOver(worldInstance) {
    isGamePaused = true;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.add('d-none');
    worldInstance?.pauseAllSounds();
    addLeaderboardEntry(worldInstance, 'lose');
}


function onWin(worldInstance) {
    isGamePaused = true;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.add('d-none');
    worldInstance?.pauseAllSounds?.();
    addLeaderboardEntry(worldInstance, 'win');
}