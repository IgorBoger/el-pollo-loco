function openOverlay(overlayId, opts = {}) {
    if (opts.rememberBurger) rememberBurgerState();
    if (opts.rememberBurger) closeBurgerIfRemembered();
    if (typeof opts.onOpen === 'function') opts.onOpen();
    showOverlay(overlayId);
}


function showOverlay(overlayId) {
    const ov = getEl(overlayId);
    if (!ov) return;
    prepareOverlayShow(ov);
    requestAnimationFrame(() => ov.classList.add('is-open'));
}


function prepareOverlayShow(ov) {
    ov.classList.remove('d-none');
    ov.classList.add('d-flex');
}


function closeOverlay(overlayId, opts = {}) {
    hideOverlay(overlayId);
    if (opts.rememberBurger) restoreBurgerIfRemembered();
    if (typeof opts.onClose === 'function') opts.onClose();
}


function hideOverlay(overlayId) {
    const ov = getEl(overlayId);
    if (!ov) return;
    ov.classList.remove('is-open');
    waitOverlayFadeOut(ov, () => finalizeOverlayHide(ov));
}


function finalizeOverlayHide(ov) {
    ov.classList.remove('d-flex');
    ov.classList.add('d-none');
}


function getEl(id) {
    return document.getElementById(id);
}


function waitOverlayFadeOut(ov, done) {
    const finish = createFinishHandler(ov, done);
    bindOverlayTransitionEnd(ov, finish);
    setFadeOutFallback(finish);
}


function createFinishHandler(ov, done) {
    let finished = false;
    return function finish() {
        if (finished) return;
        finished = true;
        ov.removeEventListener('transitionend', finish);
        done();
    };
}


function bindOverlayTransitionEnd(ov, finish) {
    ov.addEventListener('transitionend', (e) => {
        if (e.target === ov) finish();
    });
}


function setFadeOutFallback(finish) {
    setTimeout(finish, 220);
}


function closeOverlayThen(overlayId, after) {
    const ov = getEl(overlayId);
    if (!ov) return;
    ov.classList.remove('is-open');
    waitOverlayFadeOut(ov, () => {
        finalizeOverlayHide(ov);
        if (after) after();
    });
}


function rememberBurgerState() {
    window._reopenBurgerAfterOverlay = isBurgerOpen();
}


function isBurgerOpen() {
    return getEl('burgerMenu')?.classList.contains('open') || false;
}


function closeBurgerIfRemembered() {
    if (!window._reopenBurgerAfterOverlay) return;
    closeBurgerMenu();
}


function restoreBurgerIfRemembered() {
    if (!window._reopenBurgerAfterOverlay) return;
    toggleBurgerMenu();
    window._reopenBurgerAfterOverlay = false;
}


function openStoryOverlay() {
    openOverlay('storyOverlay', { rememberBurger: true });
}


function closeStoryOverlay() {
    closeOverlay('storyOverlay', { rememberBurger: true });
}


function openKeyHelpOverlay() {
    openOverlay('keyHelpOverlay', { rememberBurger: true });
}


function closeKeyHelpOverlay() {
    closeOverlay('keyHelpOverlay', { rememberBurger: true });
}


function openRankingOverlay() {
    openOverlay('rankingOverlay', {
        rememberBurger: true,
        onOpen: () => {
            renderRankingList();
            setClearRankingState();
        }
    });
}


function closeRankingOverlay() {
    closeOverlay('rankingOverlay', { rememberBurger: true });
}


function openRankingClearConfirm() {
    openOverlay('rankingClearOverlay', { onOpen: setRankingClearConfirmTexts });
}


function closeRankingClearConfirm() {
    closeOverlay('rankingClearOverlay');
}


function openImpressumOverlay() {
    openOverlay('impressumOverlay', { rememberBurger: true });
}


function closeImpressumOverlay() {
    closeOverlay('impressumOverlay', { rememberBurger: true });
}


function openLangModal() {
    openOverlay('langOverlay', { onOpen: markLangButtonActive });
}


function openWinOverlay() {
    openOverlay('winOverlay');
}

function closeWinOverlay() {
    closeOverlay('winOverlay');
}

function openGameOverOverlay() {
    openOverlay('gameOverOverlay');
}

function closeGameOverOverlay() {
    closeOverlay('gameOverOverlay');
}


function markLangButtonActive() {
    getEl('langToggle')?.classList.add('is-active');
}


function closeLangModal() {
    closeOverlay('langOverlay', { onClose: unmarkLangButtonActive });
}


function unmarkLangButtonActive() {
    getEl('langToggle')?.classList.remove('is-active');
}


function bindOutsideClose(overlayId, cardSelector, onClose) {
    const ov = getEl(overlayId);
    if (!ov) return;
    ov.addEventListener('click', (e) => {
        const card = document.querySelector(cardSelector);
        if (card && !card.contains(e.target)) onClose();
        e.stopPropagation();
    });
}


function closeEndOverlayThen(overlayId, after) {
    runEndOverlayClose(overlayId, after);
}


function runEndOverlayClose(overlayId, after) {
    const ov = getEl(overlayId);
    if (!ov) return;
    const done = createBarrier(2, () => finalizeEndClose(ov, after));
    startDomFadeOut(ov, done);
    startCanvasFadeOut(overlayId, done);
}


function createBarrier(count, afterAll) {
    let left = count;
    return function markDone() {
        left -= 1;
        if (left === 0) afterAll();
    };
}


function finalizeEndClose(ov, after) {
    finalizeOverlayHide(ov);
    after?.();
}


function startDomFadeOut(ov, done) {
    ov.classList.remove('is-open');
    waitOverlayFadeOut(ov, done);
}


function startCanvasFadeOut(overlayId, done) {
    const screen = getCanvasScreenForOverlay(overlayId);
    if (!screen?.hideSmooth) return done();
    try {
        screen.hideSmooth(done);
    } catch (e) {
        done();
    }
}


function getCanvasScreenForOverlay(overlayId) {
    if (!window.world) return null;
    if (overlayId === 'winOverlay') return world.winscreen;
    if (overlayId === 'gameOverOverlay') return world.endscreen;
    return null;
}