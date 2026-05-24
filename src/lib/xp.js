export const XP_PER_LEVEL = 100;
export const LANG_UNLOCK_LEVEL = { es: 1, it: 1, ru: 3, fr: 3 };

export function getLevel(xp)     { return Math.floor(xp / XP_PER_LEVEL) + 1; }
export function getXPInLevel(xp) { return xp % XP_PER_LEVEL; }

export function getMolejoMultiplier(streak) {
  if (streak >= 14) return 3;
  if (streak >= 7)  return 2;
  if (streak >= 3)  return 1.5;
  return 1;
}
export function getMultiplierLabel(m) { return m === 1 ? null : `×${m}`; }
