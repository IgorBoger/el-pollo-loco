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
    const mobileControls = document.getElementById('mobileControls');
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 800;
    if (!mobileControls) return;
    if (isMobile || isSmallScreen) {
        mobileControls.classList.remove('d-none');
        mobileControls.classList.add('d-flex');
    } else {
        mobileControls.classList.remove('d-flex');
        mobileControls.classList.add('d-none');
    }
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