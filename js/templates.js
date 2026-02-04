/**
 * Builds the HTML template for a ranking table row.
 *
 * @param {number} idx - The ranking position.
 * @param {Object} entry - The leaderboard entry data.
 * @param {string} resultText - The localized result text.
 * @returns {string} HTML string representing a table row.
 */
function appendRankingRowTemplate(idx, entry, resultText) {
    return `
        <td>${idx}</td>
        <td>${entry.coins}</td>
        <td>${formatDuration(entry.timeMs)}</td>
        <td>${resultText}</td>
        `;
}