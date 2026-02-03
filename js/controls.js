document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft") keyBaord.LEFT = false;
    if (event.key === "ArrowRight") keyBaord.RIGHT = false;
    if (event.key === " ") keyBaord.SPACE = false;
    if (event.key === "d") keyBaord.THROW = false;
});


document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") keyBaord.LEFT = true;
    if (event.key === "ArrowRight") keyBaord.RIGHT = true;
    if (event.key === " ") keyBaord.SPACE = true;
    if (event.key === "d") keyBaord.THROW = true;
    if (event.key === "Escape") {
        if (typeof isOverlayOpen === 'function' && isOverlayOpen('rankingClearOverlay')) {
            closeRankingClearConfirm();
            return;
        }
        closeKeyHelpOverlay();
        closeStoryOverlay();
        closeLangModal();
        closeRankingOverlay();
        closeImpressumOverlay();
    }


});


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


function updateMobileControlsVisibility() {
    const mobileControls = getMobileControlsElement();
    if (!mobileControls) return;
    if (shouldShowMobileControls()) return showMobileControls(mobileControls);
    hideMobileControls(mobileControls);
}

function getMobileControlsElement() {
    return document.getElementById('mobileControls');
}


function shouldShowMobileControls() {
    return isMobileDevice() || isSmallScreen();
}


function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


function isSmallScreen() {
    return window.innerWidth < 800;
}


function showMobileControls(mobileControls) {
    mobileControls.classList.remove('d-none');
    mobileControls.classList.add('d-flex');
}


function hideMobileControls(mobileControls) {
    mobileControls.classList.remove('d-flex');
    mobileControls.classList.add('d-none');
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