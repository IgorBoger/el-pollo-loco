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
let reopenBurgerAfterOverlay = false;
// let isGamePaused = false;
var isGamePaused = false;
let gameStartAt = 0;
const LEADERBOARD_KEY = 'leaderboard';



function init() {
    canvas = document.getElementById('canvas');
    setupHiDPICanvas();
    world = new World(canvas, keyBaord);
    console.log('My Caracter is ', world);

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
    console.log('gecklickt');
    isGamePaused = false;
    gameStartAt = Date.now();
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.classList.remove('d-none');
    setPauseButtonLabel(I18N[currentLanguage] || I18N.ES);
    document.getElementById('startScreen').classList.add('d-none');
    init();
    playBackgroundIfAllowed();
}


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


function restartGame() {
    closeBurgerMenu();

    console.log(isGamePaused);

    document.getElementById('pauseBtn')?.classList.add('d-none');
    // Game-Over Overlay zu
    document.getElementById('gameOverOverlay')?.classList.add('d-none');
    document.getElementById('gameOverOverlay')?.classList.remove('d-flex');

    // alte Welt sauber zerstören
    if (world && typeof world.destroy === "function") {
        world.destroy();
    }

    document.getElementById('startScreen').classList.remove('d-none');
}


function openStoryOverlay() {
    const overlay = document.getElementById('storyOverlay');
    if (!overlay) return;

    const burger = document.getElementById('burgerMenu');
    reopenBurgerAfterOverlay = burger?.classList.contains('open') || false;

    if (reopenBurgerAfterOverlay) {
        closeBurgerMenu(); // sanft nach rechts, wie gehabt
    }

    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');
}


function closeStoryOverlay() {
    const overlay = document.getElementById('storyOverlay');
    if (!overlay) return;

    if (reopenBurgerAfterOverlay) {
        toggleBurgerMenu(); // sanft nach links wieder auf
        reopenBurgerAfterOverlay = false;
    }

    overlay.classList.remove('d-flex');
    overlay.classList.add('d-none');
}


/* === KEY-HELP: öffnen/schließen === */
function openKeyHelpOverlay() {
    const overlay = document.getElementById('keyHelpOverlay');
    if (!overlay) return;

    const burger = document.getElementById('burgerMenu');
    reopenBurgerAfterOverlay = burger?.classList.contains('open') || false;

    if (reopenBurgerAfterOverlay) {
        closeBurgerMenu(); // sanft nach rechts, wie gehabt
    }

    // renderKeyHelpTable();
    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');   // zentriert dank Flex
}

function closeKeyHelpOverlay() {
    const overlay = document.getElementById('keyHelpOverlay');
    if (!overlay) return;

    if (reopenBurgerAfterOverlay) {
        toggleBurgerMenu(); // sanft nach links wieder auf
        reopenBurgerAfterOverlay = false;
    }

    overlay.classList.add('d-none');
    overlay.classList.remove('d-flex');
}


// 3) Datei: game.js — Funktionen: Leaderboard Helpers (NEU)
function addLeaderboardEntry(worldInstance, resultKey) {
    const list = getLeaderboard();
    list.push(buildLeaderboardEntry(worldInstance, resultKey));
    const sorted = sortLeaderboard(list).slice(0, 10);
    saveLeaderboard(sorted);
}


function getLeaderboard() {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) || []; }
    catch { return []; }
}


function buildLeaderboardEntry(worldInstance, resultKey) {
    return {
        coins: worldInstance?.character?.coin || 0,
        timeMs: getRunDurationMs(),
        // result: buildResultLabel(resultKey),
        resultKey: resultKey,
        at: Date.now()
    };
}


function getRunDurationMs() {
    if (!gameStartAt) return 0;
    return Math.max(0, Date.now() - gameStartAt);
}


function buildResultLabel(resultKey) {
    const t = I18N[currentLanguage] || I18N.ES;
    return resultKey === 'win' ? t.rankingResultWin : t.rankingResultLose;
}


function sortLeaderboard(list) {
    return list.sort((a, b) => (b.coins - a.coins) || (a.timeMs - b.timeMs));
}


function saveLeaderboard(list) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
}


// 4) Datei: game.js — Funktionen: Render Rangliste(NEU)
function renderRankingList() {
    const tbody = document.getElementById('rankingTbody');
    if (!tbody) return;
    clearRankingTable();
    const list = getLeaderboard();
    setRankingEmptyVisible(list.length === 0);
    list.forEach((e, i) => appendRankingRow(tbody, i + 1, e));
}


function clearRankingTable() {
    const tbody = document.getElementById('rankingTbody');
    if (tbody) tbody.innerHTML = '';
}


function setRankingEmptyVisible(isEmpty) {
    const empty = document.getElementById('rankingEmpty');
    if (!empty) return;
    empty.classList.toggle('d-none', !isEmpty);
}


function appendRankingRow(tbody, idx, entry) {
    const tr = document.createElement('tr');
    const resultText = getResultLabel(entry);
    tr.innerHTML = `<td>${idx}</td><td>${entry.coins}</td><td>${formatDuration(entry.timeMs)}</td><td>${resultText}</td>`;
    tbody.appendChild(tr);
}


function getResultLabel(entry) {
    const t = I18N[currentLanguage] || I18N.ES;
    const key = entry?.resultKey || '';
    if (key === 'win') return t.rankingResultWin;
    if (key === 'lose') return t.rankingResultLose;
    return entry?.result || '';
}


function formatDuration(ms) {
    const total = Math.floor(ms / 1000);
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
}


function openRankingOverlay() {
    const overlay = document.getElementById('rankingOverlay');
    if (!overlay) return;
    rememberBurgerStateForOverlay();
    closeBurgerIfNeeded();
    renderRankingList();
    setClearRankingState();
    showOverlayFlex(overlay);
}


function closeRankingOverlay() {
    const overlay = document.getElementById('rankingOverlay');
    if (!overlay) return;
    restoreBurgerAfterOverlay();
    hideOverlayFlex(overlay);
}


function clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
}


function setClearRankingState() {
    const btn = document.getElementById('rankingClear');
    if (!btn) return;
    btn.disabled = !hasLeaderboardEntries();
}


function hasLeaderboardEntries() {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (!data) return false;
    return JSON.parse(data).length > 0;
}


function onClearRankingClick() {
    openRankingClearConfirm();
}


function openRankingClearConfirm() {
    const ov = document.getElementById('rankingClearOverlay');
    if (!ov) return;
    setRankingClearConfirmTexts();
    showOverlayFlex(ov);
}


function setRankingClearConfirmTexts() {
    const txt = getRankingClearTexts();
    setTextById('rankingClearTitle', txt.title);
    setTextById('rankingClearText', txt.text);
    setTextById('rankingClearOk', txt.ok);
    setTextById('rankingClearCancel', txt.cancel);
}


function getRankingClearTexts() {
    const t = I18N[currentLanguage] || I18N.ES;
    return {
        title: t.rankingClearTitle || 'Rangliste löschen',
        text: t.rankingClearText || 'Willst du wirklich alle Einträge löschen?',
        ok: t.rankingClearOk || 'Löschen',
        cancel: t.rankingClearCancel || 'Abbrechen'
    };
}


function setTextById(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
}


function closeRankingClearConfirm() {
    const ov = document.getElementById('rankingClearOverlay');
    if (!ov) return;
    hideOverlayFlex(ov);
}


function onRankingClearConfirm() {
    clearLeaderboard();
    renderRankingList();
    setClearRankingState();
    closeRankingClearConfirm();
}


function onRankingClearCancel() {
    closeRankingClearConfirm();
}


function onRankingClearOverlayClick(e) {
    if (e.target.id !== 'rankingClearOverlay') return;
    closeRankingClearConfirm();
}


function rememberBurgerStateForOverlay() {
    const burger = document.getElementById('burgerMenu');
    reopenBurgerAfterOverlay = burger?.classList.contains('open') || false;
}


function closeBurgerIfNeeded() {
    if (reopenBurgerAfterOverlay) closeBurgerMenu();
}


function restoreBurgerAfterOverlay() {
    if (!reopenBurgerAfterOverlay) return;
    toggleBurgerMenu();
    reopenBurgerAfterOverlay = false;
}


function showOverlayFlex(overlay) {
    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');
}


function hideOverlayFlex(overlay) {
    overlay.classList.remove('d-flex');
    overlay.classList.add('d-none');
}


function toggleBurgerMenu() {
    const menu = document.getElementById('burgerMenu');
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
        menu.classList.remove('open');
        setTimeout(() => menu.classList.add('d-none'), 300);
    } else {
        menu.classList.remove('d-none');
        setTimeout(() => menu.classList.add('open'), 10);
    }
}


function closeBurgerMenu() {
    const menu = document.getElementById('burgerMenu');
    if (!menu) return;

    if (menu.classList.contains('open')) {
        menu.classList.remove('open');

        const onEnd = (e) => {
            if (e.propertyName === 'transform') {
                menu.classList.add('d-none');
                menu.removeEventListener('transitionend', onEnd);
            }
        };
        menu.addEventListener('transitionend', onEnd);
    }
}


function openSettingsOverlay() {
    const burger = document.getElementById('burgerMenu');
    const settings = document.getElementById('settingsOverlay');
    burger.classList.remove('open');
    setTimeout(() => burger.classList.add('d-none'), 300);
    settings.classList.remove('d-none');
    setTimeout(() => settings.classList.add('open'), 320);
}


function closeSettingsOverlay() {
    const burger = document.getElementById('burgerMenu');
    const settings = document.getElementById('settingsOverlay');
    settings.classList.remove('open');
    setTimeout(() => settings.classList.add('d-none'), 300);
    burger.classList.remove('d-none');
    setTimeout(() => burger.classList.add('open'), 320);
}


function openImpressumOverlay() {
    const overlay = document.getElementById('impressumOverlay');
    if (!overlay) return;

    const burger = document.getElementById('burgerMenu');
    window._reopenBurgerAfterImpressum = burger?.classList.contains('open') || false;

    if (window._reopenBurgerAfterImpressum) {
        closeBurgerMenu();
    }

    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');
}

function closeImpressumOverlay() {
    const overlay = document.getElementById('impressumOverlay');
    if (!overlay) return;

    if (window._reopenBurgerAfterImpressum) {
        toggleBurgerMenu();
        window._reopenBurgerAfterImpressum = false;
    }

    overlay.classList.remove('d-flex');
    overlay.classList.add('d-none');
}



// Datei: game.js — Funktion: outsideCloseHandler (NEU)
function outsideCloseHandler(e) {
    const burger = document.getElementById('burgerMenu');
    const settings = document.getElementById('settingsOverlay');
    const burgerBtn = document.getElementById('burgerBtn');
    const langOv = document.getElementById('langOverlay');
    const keyHelp = document.getElementById('keyHelpOverlay');
    const storyOv = document.getElementById('storyOverlay');
    const impressum = document.getElementById('impressumOverlay');

    // 7) Datei: game.js — Funktion: outsideCloseHandler Rangliste berücksichtigen
    const ranking = document.getElementById('rankingOverlay');

    if ((langOv && !langOv.classList.contains('d-none')) ||
        (keyHelp && !keyHelp.classList.contains('d-none')) ||
        (storyOv && !storyOv.classList.contains('d-none')) ||
        (impressum && !impressum.classList.contains('d-none')) ||
        (ranking && !ranking.classList.contains('d-none'))) {
        return;
    }

    // 1) Settings offen? → Klick NICHT im Settings & NICHT auf Burger-Button ⇒ sanft schließen
    if (settings && settings.classList.contains('open')
        && !settings.contains(e.target) && e.target !== burgerBtn) {
        closeSettingsOverlay();     // nutzt deine bestehende sanfte Animation
        return;                     // nur eins schließen pro Klick
    }

    // 2) Burger offen? → Klick NICHT im Burger & NICHT auf Burger-Button ⇒ sanft schließen
    if (burger && burger.classList.contains('open')
        && !burger.contains(e.target) && e.target !== burgerBtn) {
        closeBurgerMenu();          // nutzt deine bestehende sanfte Animation
    }
}


function toggleMusic() {
    isMusicMuted = !isMusicMuted;
    localStorage.setItem('isMusicMuted', isMusicMuted);
    const icon = document.getElementById('musicIcon');
    if (icon) icon.src = isMusicMuted ? 'img/mute.png' : 'img/speaker.png';
    const bg = world?.sounds?.background;
    if (bg) {
        bg.muted = isMusicMuted;
        if (!isMusicMuted) {
            bg.play().catch((e) => console.warn('Musik konnte nicht gestartet werden:', e));
        } else {
            bg.pause();
            bg.currentTime = 0; // optional: bei jedem Mute zurück
        }
    }

}

function toggleSound() {
    isSoundMuted = !isSoundMuted;
    localStorage.setItem('isSoundMuted', isSoundMuted);
    const icon = document.getElementById('soundIcon');
    if (icon) icon.src = isSoundMuted ? 'img/mute.png' : 'img/speaker.png';
    if (!world || !world.sounds) return;
    for (const [name, sound] of Object.entries(world.sounds)) {
        if (name !== 'background' && sound instanceof Audio) {
            sound.muted = isSoundMuted;
        }
    }
}


// Datei: game.js — Funktion: openLangModal
function openLangModal() {
    const overlay = document.getElementById('langOverlay');
    if (!overlay) return; // ⬅️ Guard

    const btn = document.getElementById('langToggle');
    overlay.classList.remove('d-none');
    overlay.classList.add('d-flex');   // zeigt Overlay + zentriert Card
    btn?.classList.add('is-active');   // Button optisch aktiv (grün)
}


// Datei: game.js — Funktion: closeLangModal
function closeLangModal() {
    const overlay = document.getElementById('langOverlay');
    const btn = document.getElementById('langToggle');
    overlay.classList.remove('d-flex');
    overlay.classList.add('d-none');
    btn?.classList.remove('is-active');
}


// Datei: game.js — Funktion: onLangOptionClick (NEU)
function onLangOptionClick(e) {
    const btn = e.target.closest('.lang-opt');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    if (!lang) return;

    // vorhandene Sprachlogik nutzen
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



document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft") {
        keyBaord.LEFT = false;
    }
    if (event.key === "ArrowRight") {
        keyBaord.RIGHT = false;
    }
    if (event.key === " ") {
        keyBaord.SPACE = false;
    }
    if (event.key === "ArrowUp") {
        console.log('up');
        keyBaord.UP = false;
        console.log('up is :' + keyBaord.UP);
        console.log(keyBaord);
    }
    if (event.key === "ArrowDown") {
        console.log('down');
        keyBaord.DOWN = false;
        console.log('down is :' + keyBaord.DOWN);
        console.log(keyBaord);
    }
    if (event.key === "d") {
        // console.log('throw');
        keyBaord.THROW = false;
        // console.log('throw is :' + keyBaord.THROW);
        // console.log(keyBaord);
    }
});


document.addEventListener("keydown", function (event) {
    // console.log(event.key);

    if (event.key === "ArrowLeft") {
        keyBaord.LEFT = true;
    }
    if (event.key === "ArrowRight") {
        keyBaord.RIGHT = true;
    }
    if (event.key === " ") {
        keyBaord.SPACE = true;
    }
    if (event.key === "ArrowUp") {
        console.log('up');
        keyBaord.UP = true;
        console.log('up is :' + keyBaord.UP);
        console.log(keyBaord);
    }
    if (event.key === "ArrowDown") {
        console.log('down');
        keyBaord.DOWN = true;
        console.log('up is :' + keyBaord.DOWN);
        console.log(keyBaord);
    }
    if (event.key === "d") {
        // console.log('throw');
        keyBaord.THROW = true;
        // console.log('throw is :' + keyBaord.THROW);
        // console .log(keyBaor d); 
    }

    // if (e.key === 'Escape') closeKeyHelpOverlay();
    if (event.key === "Escape") {
        closeKeyHelpOverlay();
        closeStoryOverlay();
        closeLangModal();
        closeRankingOverlay();
        closeImpressumOverlay();

    }
});


function updateMobileControlsVisibility() {
    // console.log('updateMobileControlsVisibility aufgerufen');
    const mobileControls = document.getElementById('mobileControls');
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 800;
    if (!mobileControls) return;

    if (isMobile || isSmallScreen) {
        // console.log('display ist unter 800px ODER mobil');

        mobileControls.classList.remove('d-none');
        mobileControls.classList.add('d-flex');
    } else {
        // console.log('display ist größer als 800px UND nicht mobil');
        mobileControls.classList.remove('d-flex');
        mobileControls.classList.add('d-none');
    }
}


function addMobileButtonsFunction() {
    buttons.forEach((btn) => {
        const el = document.getElementById(btn.id);
        if (!el) return;
        bindMobileControl(el, btn.key);
    });
}


function bindMobileControl(el, actionKey) {
    preventContextMenu(el);
    bindPointerPressBlock(el);
    bindTouchControls(el, actionKey);
    bindMouseControls(el, actionKey);
}


function preventContextMenu(el) {
    if (!el) return;
    el.addEventListener('contextmenu', (e) => {
        if (e.pointerType === 'mouse') return;
        e.preventDefault();
        e.stopPropagation();
    }, true);
}


function bindPointerPressBlock(el) {
    el.addEventListener('pointerdown', (e) => handlePointerDown(el, e), { passive: false });
    el.addEventListener('pointerup', () => toggleRightClickPressBlock(el, false), { passive: true });
    el.addEventListener('pointerleave', () => toggleRightClickPressBlock(el, false), { passive: true });
    el.addEventListener('pointercancel', () => toggleRightClickPressBlock(el, false), { passive: true });
}


function handlePointerDown(el, e) {
    const isRightMouse = e.pointerType === 'mouse' && e.button === 2;
    toggleRightClickPressBlock(el, isRightMouse);
    if (isRightMouse) e.preventDefault();
}


function bindTouchControls(el, actionKey) {
    el.addEventListener('touchstart', (e) => touchPress(el, actionKey, e), { passive: false });
    el.addEventListener('touchend', (e) => touchRelease(el, actionKey, e), { passive: false });
    el.addEventListener('touchcancel', (e) => touchRelease(el, actionKey, e), { passive: false });
}


function touchPress(el, actionKey, e) {
    e.preventDefault();
    el.classList.add('is-pressed');
    setKey(actionKey, true);
}


function setKey(actionKey, state) {
    keyBaord[actionKey] = state;
}


function touchRelease(el, actionKey, e) {
    e.preventDefault();
    el.classList.remove('is-pressed');
    setKey(actionKey, false);
}


function bindMouseControls(el, actionKey) {
    el.addEventListener('mousedown', (e) => mousePress(actionKey, e), { passive: false });
    el.addEventListener('mouseup', (e) => mouseRelease(actionKey, e), { passive: true });
    el.addEventListener('mouseleave', () => setKey(actionKey, false), { passive: true });
}


function mousePress(actionKey, e) {
    if (!isLeftClick(e)) { e.preventDefault(); return; }
    setKey(actionKey, true);
}


function mouseRelease(actionKey, e) {
    if (isLeftClick(e)) setKey(actionKey, false);
}


function resetMobileKeys() {
    buttons.forEach((b) => setKey(b.key, false));
}


function addReleaseGuards() {
    window.addEventListener('blur', resetMobileKeys);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) resetMobileKeys();
    });
}


function isLeftClick(e) {
    return e && e.button === 0;
}


function toggleRightClickPressBlock(el, isBlocked) {
    if (!el) return;
    el.classList.toggle('no-active-press', isBlocked);
}


function toggleFullscreen() {
    const el = document.getElementById('gameContainer');
    if (document.fullscreenElement) {
        document.exitFullscreen?.();
    } else {
        (el.requestFullscreen
            || el.webkitRequestFullscreen
            || el.msRequestFullscreen
            || el.mozRequestFullScreen
        )?.call(el);
    }
}


function togglePause() {
    if (!world) return;
    isGamePaused = !isGamePaused;
    const btn = document.getElementById('pauseBtn');
    // if (btn) btn.textContent = isGamePaused ? 'Play ▶' : 'Pause ❚❚';
    setPauseButtonLabel(I18N[currentLanguage] || I18N.ES);
    if (isGamePaused) {
        world.pauseAllSounds();        //  ⬅️ NEU
        return;
    }
    if (world.character) {
        world.character.lastActivityAt = performance.now();
    }
    if (world.character) world.character.lastActivityAt = performance.now();
    playBackgroundIfAllowed();
}



// Datei: js/game.js — NEU
function quickRestartGame() {

    isGamePaused = false;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.remove('d-none');
    // if (pauseBtn) pauseBtn.textContent = 'Pause ❚❚';
    setPauseButtonLabel(I18N[currentLanguage] || I18N.ES);

    // Startscreen bleibt versteckt:
    document.getElementById('startScreen')?.classList.add('d-none');

    // Endscreen-Overlay schließen (falls noch offen)
    document.getElementById('gameOverOverlay')?.classList.add('d-none');
    document.getElementById('gameOverOverlay')?.classList.remove('d-flex');

    // Alte Welt sauber zerstören
    if (world && typeof world.destroy === 'function') {
        world.destroy();
    }

    // Neu initialisieren (direkt ins Spiel)
    if (!canvas) {
        canvas = document.getElementById('canvas');
        setupHiDPICanvas();
    }
    world = new World(canvas, keyBaord);
    playBackgroundIfAllowed();
    handleViewportChange?.();
}


function fitCanvasToCssSize() {
    const c = document.getElementById('canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const BASE_W = 720, BASE_H = 480;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    // const cssW = Math.round(c.clientWidth); cssH = Math.round(c.clientHeight);
    const cssW = Math.round(c.clientWidth);
    const cssH = Math.round(c.clientHeight);
    if (!cssW || !cssH) return;
    const pxW = cssW * dpr, pxH = cssH * dpr;
    if (c.width !== pxW || c.height !== pxH) { c.width = pxW; c.height = pxH; }
    const scale = Math.min(pxW / BASE_W, pxH / BASE_H);
    // const offX = (pxW - BASE_W * scale) / 2; offY = (pxH - BASE_H * scale) / 2;
    const offX = (pxW - BASE_W * scale) / 2;
    const offY = (pxH - BASE_H * scale) / 2;
    window.viewOffsetX = offX / scale;
    ctx.setTransform(scale, 0, 0, scale, offX, offY);
    ctx.imageSmoothingEnabled = true;
}


function handleViewportChange() {
    if (_viewportRaf) return;
    _viewportRaf = requestAnimationFrame(() => {
        fitCanvasToCssSize();
        if (world
            && world.character?.isDead?.()
            && world.endscreen?.visible) {
            world.drawStaticFrame?.();
            world.endscreen.draw();
        }
        updateMobileControlsVisibility();
        checkOrientation();
        _viewportRaf = null;
    });
}


function onGameOver(worldInstance) {
    isGamePaused = true;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.add('d-none');
    // const bg = worldInstance?.sounds?.background;
    // worldInstance?.pauseAllSounds();
    worldInstance?.pauseAllSounds();
    addLeaderboardEntry(worldInstance, 'lose');
}


function onWin(worldInstance) {
    isGamePaused = true;
    // document.getElementById('pauseBtn')?.classList.add('d-none');
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn?.classList.add('d-none');
    worldInstance?.pauseAllSounds?.();
    addLeaderboardEntry(worldInstance, 'win');
}


function setupHiDPICanvas() {
    fitCanvasToCssSize();
}


window.addEventListener('load', () => {
    applyTranslations();
    handleViewportChange();

    addMobileButtonsFunction();
    document.getElementById('restartGame')?.addEventListener('click', restartGame);

    document.getElementById('pauseBtn')?.addEventListener('click', togglePause);

    document.getElementById('burgerBtn')?.addEventListener('click', toggleBurgerMenu);
    document.getElementById('burgerClose')?.addEventListener('click', closeBurgerMenu);
    document.getElementById('openSettings')?.addEventListener('click', openSettingsOverlay);
    document.getElementById('closeSettings')?.addEventListener('click', closeSettingsOverlay);
    // Datei: game.js — im vorhandenen window.addEventListener('load', ...) GANZ AM ENDE ergänzen:
    document.addEventListener('click', outsideCloseHandler);


    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    // document.getElementById('langToggle').addEventListener('click', toggleLanguage);
    const musicIcon = document.getElementById('musicIcon');
    const soundIcon = document.getElementById('soundIcon');
    if (musicIcon) musicIcon.src = isMusicMuted ? 'img/mute.png' : 'img/speaker.png';
    if (soundIcon) soundIcon.src = isSoundMuted ? 'img/mute.png' : 'img/speaker.png';

    // Datei: game.js — im load-Handler ergänzen
    document.getElementById('langToggle')?.addEventListener('click', openLangModal);
    document.getElementById('langClose')?.addEventListener('click', closeLangModal);

    // Klick außerhalb der Karte schließt NUR Sprache; Ereignis stoppt hier.
    document.getElementById('langOverlay')?.addEventListener('click', (e) => {
        const card = document.querySelector('#langOverlay .modal-card');
        if (card && !card.contains(e.target)) closeLangModal();
        e.stopPropagation(); // ✅ verhindert, dass der globale Outside-Click ausgelöst wird
    });

    // Optionen (Delegation auf Container)
    document.querySelector('#langOverlay .modal-content')
        ?.addEventListener('click', (e) => {
            onLangOptionClick(e);
            e.stopPropagation(); // sicherheitshalber
        });


    document.getElementById('aboutGame')?.addEventListener('click', openStoryOverlay);
    document.getElementById('closeStory')?.addEventListener('click', closeStoryOverlay);
    document.getElementById('storyOverlay')?.addEventListener('click', (e) => {
        const card = document.querySelector('#storyOverlay .story-card'); // <— FIX
        if (card && !card.contains(e.target)) closeStoryOverlay();
        e.stopPropagation(); // <— verhindert Nebeneffekte
    });



    // 1) Menü-Button → click
    document.getElementById('keyHelpButton')?.addEventListener('click', openKeyHelpOverlay);

    // 2) Overlay-Schließen → click auf X
    document.getElementById('keyHelpClose')?.addEventListener('click', closeKeyHelpOverlay);

    // 3) Klick auf den dunklen Hintergrund schließt (und stoppt Bubbling,
    //    damit dein globaler outsideCloseHandler nicht zusätzlich feuert)
    document.getElementById('keyHelpOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeKeyHelpOverlay();
        e.stopPropagation();
    });


    document.getElementById('restartBtn')?.addEventListener('click', () => {
        quickRestartGame();
    });

    document.getElementById('homeBtn')?.addEventListener('click', () => {
        // Home = Startseite: deinen vorhandenen Weg nutzen
        // Schließt Overlay & zeigt Startscreen; Welt wird in restartGame() zerstört
        document.getElementById('gameOverOverlay')?.classList.add('d-none');
        document.getElementById('gameOverOverlay')?.classList.remove('d-flex');
        restartGame(); // existiert bereits und zeigt den Startscreen wieder an

        // document.getElementById('pauseBtn')?.classList.add('d-none');
    });


    document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
        document.getElementById('winOverlay')?.classList.add('d-none');
        document.getElementById('winOverlay')?.classList.remove('d-flex');
        quickRestartGame();
    });

    document.getElementById('winHomeBtn')?.addEventListener('click', () => {
        document.getElementById('winOverlay')?.classList.add('d-none');
        document.getElementById('winOverlay')?.classList.remove('d-flex');
        restartGame();
    });

    bindImpressumOverlayEvents();
    bindRankingOverlayEvents();
    bindRankingClearOverlayEvents();
    addReleaseGuards();
});


function bindImpressumOverlayEvents() {
    document.getElementById('impressumButton')?.addEventListener('click', openImpressumOverlay);
    document.getElementById('impressumClose')?.addEventListener('click', closeImpressumOverlay);
    document.getElementById('impressumOverlay')?.addEventListener('click', (e) => {
        const card = document.querySelector('#impressumOverlay .impressum-card');
        if (card && !card.contains(e.target)) {
            closeImpressumOverlay();
        }
        e.stopPropagation();
    });
}


function bindRankingOverlayEvents() {
    document.getElementById('rankingList')?.addEventListener('click', openRankingOverlay);
    document.getElementById('rankingClose')?.addEventListener('click', closeRankingOverlay);
    document.getElementById('rankingClear')?.addEventListener('click', onClearRankingClick);
    document.getElementById('rankingOverlay')?.addEventListener('click', (e) => {
        const card = document.querySelector('#rankingOverlay .ranking-card');
        if (card && !card.contains(e.target)) closeRankingOverlay();
        e.stopPropagation();
    });
}


function bindRankingClearOverlayEvents() {
    document.getElementById('rankingClearOk')?.addEventListener('click', onRankingClearConfirm);
    document.getElementById('rankingClearCancel')?.addEventListener('click', onRankingClearCancel);
    document.getElementById('rankingClearOverlay')?.addEventListener('click', onRankingClearOverlayClick);
}


window.addEventListener('resize', handleViewportChange, { passive: true });
window.addEventListener('orientationchange', handleViewportChange);
document.addEventListener('fullscreenchange', handleViewportChange);