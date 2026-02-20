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
window.currentLanguage = getSetting('language') || 'EN';
var isGamePaused = false;
window.isGamePaused = isGamePaused;
let gameStartAt = 0;
const LEADERBOARD_KEY = 'leaderboard';
const levels = [level1, level2, level3];
let currentLevelIndex = getInitialLevelIndex();
let currentLevelDefinition = levels[currentLevelIndex];


/**
 * Initializes the game canvas and creates a new world instance.
 * @returns {void}
 */
function init() {
    canvas = document.getElementById('canvas');
    setupHiDPICanvas();
    world = new World(canvas, keyBaord, currentLevelDefinition);
}


/**
 * Starts the game and initializes runtime state.
 * @returns {void}
 */
function startGame() {
    syncLevelFromStorage();
    setGamePausedState(false);
    gameStartAt = Date.now();
    showPauseButton();
    updatePauseButtonUi();
    init();
    initAudioHud();
    startAfterFirstFrame();
}


/**
 * Syncs the current level index/definition from persisted storage before starting a new run.
 * @returns {void}
 */
function syncLevelFromStorage() {
    const index = getInitialLevelIndex();
    applyLevelIndex(index);
}


/**
 * Applies a level index to runtime variables.
 * @param {number} index
 * @returns {void}
 */
function applyLevelIndex(index) {
    currentLevelIndex = index;
    currentLevelDefinition = levels[currentLevelIndex];
}


/**
 * Starts the game after the first render frame to avoid a black canvas flash.
 * @returns {void}
 */
function startAfterFirstFrame() {
    requestAnimationFrame(() => scheduleStartScreenClose());
}


/**
 * Schedules start screen close to reduce black canvas flash.
 * @returns {void}
 */
function scheduleStartScreenClose() {
    setTimeout(() => closeStartScreen(onStartScreenClosed), 140);
}


/**
 * Continues startup after the start screen is fully closed.
 * @returns {void}
 */
function onStartScreenClosed() {
    playBackgroundIfAllowed();
    updateLevelIndicator();
}


/**
 * Sets the global paused state of the game.
 * @param {boolean} state
 * @returns {void}
 */
function setGamePausedState(state) {
    isGamePaused = state;
    window.isGamePaused = state;
}


/**
 * Restarts the game and returns to the start screen.
 * @returns {void}
 */
function restartGame() {
    resetToFirstLevel();
    goToStartScreen();
}


/**
 * Returns to the start screen without resetting the current level.
 * @returns {void}
 */
function goToStartScreen() {
    hideLevelIndicator();
    closeBurgerMenu();
    hideAudioHud();
    hidePauseButton();
    destroyWorldIfExists();
    openStartScreen();
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
 * Hides the pause button.
 * @returns {void}
 */
function hidePauseButton() {
    document.getElementById('pauseBtn')?.classList.add('d-none');
}


/**
 * Restarts the game core without UI resets.
 * @returns {void}
 */
function restartGameCore() {
    if (world && typeof world.destroy === "function") world.destroy();
    openStartScreen();
}


/**
 * Toggles the paused state of the game.
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
 * @returns {void}
 */
function quickRestartGame() {
    setGamePausedState(false);
    showPauseButton();
    updatePauseButtonUi();
    closeStartScreen();
    destroyWorldIfExists();
    ensureCanvasReady();
    createNewWorld();
    updateLevelIndicator();
    playBackgroundIfAllowed();
    handleViewportChange?.();
}


/**
 * Shows the pause button.
 * @returns {void}
 */
function showPauseButton() {
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.remove('d-none');
}


/**
 * Destroys the current world instance if it exists.
 * @returns {void}
 */
function destroyWorldIfExists() {
    if (!world || typeof world.destroy !== 'function') return;
    world.destroy();
}


/**
 * Ensures the canvas element is available and ready.
 * @returns {void}
 */
function ensureCanvasReady() {
    if (canvas) return;
    canvas = document.getElementById('canvas');
    setupHiDPICanvas();
}


/**
 * Creates a new world instance.
 * @returns {void}
 */
function createNewWorld() {
    world = new World(canvas, keyBaord, currentLevelDefinition);
}


/**
 * Handles game over logic.
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
    prepareWinOverlayMode();
    openWinOverlay();
}


/**
 * Prepares win overlay UI based on level progression.
 * @returns {void}
 */
function prepareWinOverlayMode() {
    if (isLastLevelReached()) return setWinOverlayModeFinish();
    setWinOverlayModeNextLevel();
}


/**
 * Returns true if the current level index is the last one.
 * @returns {boolean}
 */
function isLastLevelReached() {
    return currentLevelIndex >= levels.length - 1;
}


/**
 * Resets the game to the first level.
 * @returns {void}
 */
function resetToFirstLevel() {
    currentLevelIndex = 0;
    currentLevelDefinition = levels[currentLevelIndex];
    setCurrentLevelIndex?.(currentLevelIndex);
}


/**
 * Returns the initial level index based on stored settings.
 * Falls no valid stored index exists, 0 is returned.
 * @returns {number} A valid level index within bounds.
 */
function getInitialLevelIndex() {
    const stored = Number(getCurrentLevelIndex?.());
    if (!Number.isFinite(stored)) return 0;
    return Math.max(0, Math.min(levels.length - 1, stored));
}


/**
 * Updates the level indicator UI.
 * @returns {void}
 */
function updateLevelIndicator() {
    setLevelIndicatorNumber(currentLevelIndex + 1);
    showLevelIndicator();
}


/**
 * Sets the displayed level number in the indicator.
 * @param {number} value
 * @returns {void}
 */
function setLevelIndicatorNumber(value) {
    const el = getLevelIndicatorNumberEl();
    if (!el) return;
    el.textContent = String(value);
}


/**
 * Returns the level indicator number element.
 * @returns {HTMLElement|null}
 */
function getLevelIndicatorNumberEl() {
    return document.getElementById('levelIndicatorNumber');
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