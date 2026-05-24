import { getStorage, setStorage } from "./storage.js";

export const SRS_INTERVALS = [1, 3, 7, 14, 30]; // days per level

export function getSrsData(langCode, deckKey) {
  return getStorage(`lf_srs_${langCode}_${deckKey}`, {});
}

export function updateSrs(srsData, langCode, deckKey, cardPt, quality) {
  // quality: "correct" | "almost" | "wrong"
  const prev = srsData[cardPt] ?? { level: 0, due: 0 };
  let newLevel, due;
  if (quality === "correct") {
    newLevel = Math.min(prev.level + 1, SRS_INTERVALS.length);
    const days = SRS_INTERVALS[Math.min(newLevel, SRS_INTERVALS.length - 1)];
    due = Date.now() + days * 86400000;
  } else if (quality === "almost") {
    // Stay at same level, due in 1 day
    newLevel = prev.level;
    due = Date.now() + 86400000;
  } else {
    // Wrong: drop one level, due immediately
    newLevel = Math.max(0, prev.level - 1);
    due = Date.now();
  }
  const next = { ...srsData, [cardPt]: { level: newLevel, due } };
  setStorage(`lf_srs_${langCode}_${deckKey}`, next);
  return next;
}

export function sortBySrs(cards, srsData) {
  const now = Date.now();
  return [...cards].sort((a, b) => {
    const da = srsData[a.pt] ?? { level: 0, due: 0 };
    const db = srsData[b.pt] ?? { level: 0, due: 0 };
    const overdueA = now - (da.due || 0);
    const overdueB = now - (db.due || 0);
    if (overdueA > 0 && overdueB > 0) return overdueB - overdueA;
    if (overdueA > 0) return -1;
    if (overdueB > 0) return  1;
    return da.level - db.level;
  });
}
