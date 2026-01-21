// Ovarlays ::::::::::
function openOverlay(overlayId, opts = {}) {
    if (opts.rememberBurger) rememberBurgerState();
    if (opts.rememberBurger) closeBurgerIfRemembered();
    if (typeof opts.onOpen === 'function') opts.onOpen();
    showOverlay(overlayId);
}


function showOverlay(overlayId) {
    const ov = getEl(overlayId);
    if (!ov) return;
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
    ov.classList.remove('d-flex');
    ov.classList.add('d-none');
}


function getEl(id) {
    return document.getElementById(id);
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