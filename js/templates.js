function appendRankingRowTemplate(idx, entry, resultText) {
    return `
        <td>${idx}</td>
        <td>${entry.coins}</td>
        <td>${formatDuration(entry.timeMs)}</td>
        <td>${resultText}</td>
        `;
}