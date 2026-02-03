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
        resultKey: resultKey,
        at: Date.now()
    };
}


function getRunDurationMs() {
    if (!gameStartAt) return 0;
    return Math.max(0, Date.now() - gameStartAt);
}


function sortLeaderboard(list) {
    return list.sort((a, b) => (b.coins - a.coins) || (a.timeMs - b.timeMs));
}


function saveLeaderboard(list) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
}


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
    tr.innerHTML = appendRankingRowTemplate(idx, entry, resultText);
    tbody.appendChild(tr);
}


function getResultLabel(entry) {
    const t = getMergedPack(currentLanguage);
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


function clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
}


function setClearRankingState() {
    const btn = document.getElementById('rankingClear');
    if (!btn) return;
    btn.disabled = !hasLeaderboardEntries();
}


function hasLeaderboardEntries() {
    return getLeaderboard().length > 0;
}


function onClearRankingClick() {
    openRankingClearConfirm();
}


function setRankingClearConfirmTexts() {
    const txt = getRankingClearTexts();
    setTextById('rankingClearTitle', txt.title);
    setTextById('rankingClearText', txt.text);
    setTextById('rankingClearOk', txt.ok);
    setTextById('rankingClearCancel', txt.cancel);
}


function getRankingClearTexts() {
    const t = getMergedPack(currentLanguage);
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