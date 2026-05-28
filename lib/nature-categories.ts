const HIDDEN_NATURE_CATEGORY_KEYS = new Set([
  "gourmand amber",
  "gourmand spice",
  "fresh woody",
  "mysterious",
  "incense",
  "earthy",
  "aromatic",
  "discovery set",
]);

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

export function isVisibleNatureCategory(value: string) {
  return !HIDDEN_NATURE_CATEGORY_KEYS.has(normalizeKey(value));
}
