/**
 * Adds a leaderboard entry for the current game run.
 *
 * @param {World} worldInstance
 * @param {string} resultKey
 * @returns {void}
 */
function addLeaderboardEntry(worldInstance, resultKey) {
    const list = getLeaderboard();
    list.push(buildLeaderboardEntry(worldInstance, resultKey));
    const sorted = sortLeaderboard(list).slice(0, 10);
    saveLeaderboard(sorted);
}


/**
 * Retrieves the leaderboard from localStorage.
 *
 * @returns {Array}
 */
function getLeaderboard() {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) || []; }
    catch { return []; }
}


/**
 * Builds a leaderboard entry object from the current game state.
 *
 * @param {World} worldInstance
 * @param {string} resultKey
 * @returns {Object}
 */
function buildLeaderboardEntry(worldInstance, resultKey) {
    return {
        coins: worldInstance?.character?.coin || 0,
        timeMs: getRunDurationMs(),
        resultKey: resultKey,
        at: Date.now()
    };
}


/**
 * Returns the current game run duration in milliseconds.
 *
 * @returns {number}
 */
function getRunDurationMs() {
    if (!gameStartAt) return 0;
    return Math.max(0, Date.now() - gameStartAt);
}


/**
 * Sorts leaderboard entries by coins (desc) and time (asc).
 *
 * @param {Array} list
 * @returns {Array}
 */
function sortLeaderboard(list) {
    return list.sort((a, b) => (b.coins - a.coins) || (a.timeMs - b.timeMs));
}


/**
 * Saves the leaderboard to localStorage.
 *
 * @param {Array} list
 * @returns {void}
 */
function saveLeaderboard(list) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
}


/**
 * Renders the ranking list table.
 *
 * @returns {void}
 */
function renderRankingList() {
    const tbody = document.getElementById('rankingTbody');
    if (!tbody) return;
    clearRankingTable();
    const list = getLeaderboard();
    setRankingEmptyVisible(list.length === 0);
    list.forEach((e, i) => appendRankingRow(tbody, i + 1, e));
}


/**
 * Clears the ranking table body.
 *
 * @returns {void}
 */
function clearRankingTable() {
    const tbody = document.getElementById('rankingTbody');
    if (tbody) tbody.innerHTML = '';
}


/**
 * Toggles the visibility of the empty ranking message.
 *
 * @param {boolean} isEmpty
 * @returns {void}
 */
function setRankingEmptyVisible(isEmpty) {
    const empty = document.getElementById('rankingEmpty');
    if (!empty) return;
    empty.classList.toggle('d-none', !isEmpty);
}


/**
 * Appends a ranking row to the table body.
 *
 * @param {HTMLElement} tbody
 * @param {number} idx
 * @param {Object} entry
 * @returns {void}
 */
function appendRankingRow(tbody, idx, entry) {
    const tr = document.createElement('tr');
    const resultText = getResultLabel(entry);
    tr.innerHTML = appendRankingRowTemplate(idx, entry, resultText);
    tbody.appendChild(tr);
}


/**
 * Returns the localized result label for a ranking entry.
 *
 * @param {Object} entry
 * @returns {string}
 */
function getResultLabel(entry) {
    const t = getMergedPack(currentLanguage);
    const key = entry?.resultKey || '';
    if (key === 'win') return t.rankingResultWin;
    if (key === 'lose') return t.rankingResultLose;
    return entry?.result || '';
}


/**
 * Formats a duration in milliseconds as mm:ss.
 *
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
    const total = Math.floor(ms / 1000);
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
}


/**
 * Clears all leaderboard entries.
 *
 * @returns {void}
 */
function clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
}


/**
 * Updates the enabled state of the ranking clear button.
 *
 * @returns {void}
 */
function setClearRankingState() {
    const btn = document.getElementById('rankingClear');
    if (!btn) return;
    btn.disabled = !hasLeaderboardEntries();
}


/**
 * Checks whether leaderboard entries exist.
 *
 * @returns {boolean}
 */
function hasLeaderboardEntries() {
    return getLeaderboard().length > 0;
}


/**
 * Handles the ranking clear button click.
 *
 * @returns {void}
 */
function onClearRankingClick() {
    openRankingClearConfirm();
}


/**
 * Sets texts for the ranking clear confirmation overlay.
 *
 * @returns {void}
 */
function setRankingClearConfirmTexts() {
    const txt = getRankingClearTexts();
    setTextById('rankingClearTitle', txt.title);
    setTextById('rankingClearText', txt.text);
    setTextById('rankingClearOk', txt.ok);
    setTextById('rankingClearCancel', txt.cancel);
}


/**
 * Returns localized texts for the ranking clear confirmation.
 *
 * @returns {Object}
 */
function getRankingClearTexts() {
    const t = getMergedPack(currentLanguage);
    return {
        title: t.rankingClearTitle || 'Rangliste löschen',
        text: t.rankingClearText || 'Willst du wirklich alle Einträge löschen?',
        ok: t.rankingClearOk || 'Löschen',
        cancel: t.rankingClearCancel || 'Abbrechen'
    };
}


/**
 * Sets text content for an element by id.
 *
 * @param {string} id
 * @param {string} text
 * @returns {void}
 */
function setTextById(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
}


/**
 * Confirms leaderboard clearing.
 *
 * @returns {void}
 */
function onRankingClearConfirm() {
    clearLeaderboard();
    renderRankingList();
    setClearRankingState();
    closeRankingClearConfirm();
}


/**
 * Cancels leaderboard clearing.
 *
 * @returns {void}
 */
function onRankingClearCancel() {
    closeRankingClearConfirm();
}


/**
 * Handles outside click on ranking clear overlay understands.
 *
 * @param {MouseEvent} e
 * @returns {void}
 */
function onRankingClearOverlayClick(e) {
    if (e.target.id !== 'rankingClearOverlay') return;
    closeRankingClearConfirm();
}