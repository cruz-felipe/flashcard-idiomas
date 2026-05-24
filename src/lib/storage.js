export function getStorage(k, fb) {
  try { return JSON.parse(localStorage.getItem(k)) ?? fb; }
  catch { return fb; }
}

export function setStorage(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); }
  catch {}
}
