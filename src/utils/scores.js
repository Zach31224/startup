const KEY = 'pythings.scores';

export function loadScores() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('loadScores parse error', e);
    return [];
  }
}

export function saveScoreEntry(entry, limit = 20) {
  const arr = loadScores();
  arr.push(entry);
  arr.sort((a, b) => b.score - a.score);
  const truncated = arr.slice(0, limit);
  localStorage.setItem(KEY, JSON.stringify(truncated));
  return truncated;
}