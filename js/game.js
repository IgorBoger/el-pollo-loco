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
// let currentLevelDefinition = level1;
const levels = [level1, level2, level3];
let currentLevelIndex = 0;
let currentLevelDefinition = levels[currentLevelIndex];



/**
 * Initializes the game canvas and creates a new world instance.
 *
 * @returns {void}
 */
function init() {
    canvas = document.getElementById('canvas');
    setupHiDPICanvas();
    world = new World(canvas, keyBaord, currentLevelDefinition);
}


/**
 * Starts the game and initializes runtime state.
 *
 * @returns {void}
 */
function startGame() {
    setGamePausedState(false);
    gameStartAt = Date.now();
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.classList.remove('d-none');
    updatePauseButtonUi();
    document.getElementById('startScreen').classList.add('d-none');
    init();
    updateLevelIndicator();
    playBackgroundIfAllowed();
}


/**
 * Sets the global paused state of the game.
 *
 * @param {boolean} state
 * @returns {void}
 */
function setGamePausedState(state) {
    isGamePaused = state;
    window.isGamePaused = state;
}


/**
 * Restarts the game and returns to the start screen.
 *
 * @returns {void}
 */
function restartGame() {
    hideLevelIndicator();
    closeBurgerMenu();
    document.getElementById('pauseBtn')?.classList.add('d-none');
    destroyWorldIfExists();
    showStartScreen();
}


/**
 * Displays the start screen.
 *
 * @returns {void}
 */
function showStartScreen() {
    document.getElementById('startScreen')?.classList.remove('d-none');
}


/**
 * Restarts the game core without UI resets.
 *
 * @returns {void}
 */
function restartGameCore() {
    if (world && typeof world.destroy === "function") world.destroy();
    document.getElementById('startScreen').classList.remove('d-none');
}


/**
 * Handles language option click events.
 *
 * @param {MouseEvent} e
 * @returns {void}
 */
function onLangOptionClick(e) {
    const lang = getLangFromClick(e);
    if (!lang) return;
    applyLanguageChange(lang);
    closeLangModal();
}


/**
 * Extracts the language code from a language option click.
 *
 * @param {MouseEvent} e
 * @returns {string|undefined}
 */
function getLangFromClick(e) {
    const btn = e.target.closest('.lang-opt');
    return btn?.getAttribute('data-lang');
}


/**
 * Applies a language change using the available language handler.
 *
 * @param {string} lang
 * @returns {void}
 */
function applyLanguageChange(lang) {
    if (typeof setLanguage === 'function') return setLanguage(lang);
    setLanguageFallback(lang);
}


/**
 * Applies a fallback language change.
 *
 * @param {string} lang
 * @returns {void}
 */
function setLanguageFallback(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', currentLanguage);
    applyTranslations?.();
}


/**
 * Toggles the paused state of the game.
 *
 * @returns {void}
 */
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


/**
 * Updates the pause button icon based on game state.
 *
 * @returns {void}
 */
function updatePauseButtonUi() {
    const btn = document.getElementById('pauseBtn');
    if (!btn) return;
    const img = btn.querySelector('img');
    if (!img) return;
    img.src = window.isGamePaused ? 'img/play.png' : 'img/pause.png';
    img.alt = window.isGamePaused ? 'Play' : 'Pause';
}


/**
 * Quickly restarts the game without returning to the start screen.
 *
 * @returns {void}
 */
function quickRestartGame() {
    setGamePausedState(false);
    showPauseButton();
    updatePauseButtonUi();
    hideStartScreen();
    destroyWorldIfExists();
    ensureCanvasReady();
    createNewWorld();
    updateLevelIndicator();
    playBackgroundIfAllowed();
    handleViewportChange?.();
}


/**
 * Shows the pause button.
 *
 * @returns {void}
 */
function showPauseButton() {
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.remove('d-none');
}


/**
 * Hides the start screen.
 *
 * @returns {void}
 */
function hideStartScreen() {
    document.getElementById('startScreen')?.classList.add('d-none');
}


/**
 * Destroys the current world instance if it exists.
 *
 * @returns {void}
 */
function destroyWorldIfExists() {
    if (!world || typeof world.destroy !== 'function') return;
    world.destroy();
}


/**
 * Ensures the canvas element is available and ready.
 *
 * @returns {void}
 */
function ensureCanvasReady() {
    if (canvas) return;
    canvas = document.getElementById('canvas');
    setupHiDPICanvas();
}


/**
 * Creates a new world instance.
 *
 * @returns {void}
 */
function createNewWorld() {
    world = new World(canvas, keyBaord, currentLevelDefinition);
}


/**
 * Handles game over logic.
 *
 * @param {World} worldInstance
 * @returns {void}
 */
function onGameOver(worldInstance) {
    hideLevelIndicator();
    setGamePausedState(true);
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.add('d-none');
    worldInstance?.pauseAllSounds();
    addLeaderboardEntry(worldInstance, 'lose');
    openGameOverOverlay();
}


/**
 * Handles win logic.
 *
 * @param {World} worldInstance
 * @returns {void}
 */
function onWin(worldInstance) {
    hideLevelIndicator();
    setGamePausedState(true);
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.add('d-none');
    worldInstance?.pauseAllSounds?.();
    addLeaderboardEntry(worldInstance, 'win');
    openWinOverlay();
}


/**
 * Updates the level indicator UI.
 * @returns {void}
 */
function updateLevelIndicator() {
    const el = document.getElementById('levelIndicator');
    if (!el) return;
    showLevelIndicator();
    el.textContent = getLevelIndicatorText();
}


/**
 * Shows the level indicator with a fade-in transition.
 * @returns {void}
 */
function showLevelIndicator() {
    const el = document.getElementById('levelIndicator');
    if (!el) return;
    el.classList.remove('d-none');
    requestAnimationFrame(() => el.classList.add('is-visible'));
}


/**
 * Hides the level indicator with a fade-out transition.
 * @returns {void}
 */
function hideLevelIndicator() {
    const el = document.getElementById('levelIndicator');
    if (!el) return;
    el.classList.remove('is-visible');
    setTimeout(() => el.classList.add('d-none'), 200);
}


/**
 * Returns the current level label.
 * @returns {string}
 */
function getLevelIndicatorText() {
    return `Level ${currentLevelIndex + 1}`;
}