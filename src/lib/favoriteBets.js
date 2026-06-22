import { getMaxOddsAmt } from "./betLogic.js";

export const STORAGE_KEY = "craps-trainer-favorites";
export const SLOT_COUNT = 6;

export const BET_LABELS = {
  pass: "Pass Line",
  dontPass: "Don't Pass",
  passOdds: "Pass Odds",
  dontPassOdds: "DP Odds",
  come: "Come",
  dontCome: "Don't Come",
  place4: "Place 4",
  place5: "Place 5",
  place6: "Place 6",
  place8: "Place 8",
  place9: "Place 9",
  place10: "Place 10",
  buy4: "Buy 4",
  buy10: "Buy 10",
  field: "Field",
  hardway4: "Hard 4",
  hardway6: "Hard 6",
  hardway8: "Hard 8",
  hardway10: "Hard 10",
  any7: "Any 7",
  anyCraps: "Any Craps",
  yo: "Yo",
  boxcars: "Boxcars",
  aces: "Aces",
  horn: "Horn",
  ce: "C&E",
  allSmall: "All Small",
  allTall: "All Tall",
  allNumbers: "All Numbers",
};

export const SHORT_LABELS = {
  pass: "Pass",
  dontPass: "DP",
  passOdds: "P Odds",
  dontPassOdds: "DP Odds",
  come: "Come",
  dontCome: "DC",
  place4: "P4",
  place5: "P5",
  place6: "P6",
  place8: "P8",
  place9: "P9",
  place10: "P10",
  buy4: "Buy 4",
  buy10: "Buy 10",
  field: "Field",
  hardway4: "H4",
  hardway6: "H6",
  hardway8: "H8",
  hardway10: "H10",
  any7: "Any 7",
  anyCraps: "Craps",
  yo: "Yo",
  boxcars: "12",
  aces: "2",
  horn: "Horn",
  ce: "C&E",
  allSmall: "Small",
  allTall: "Tall",
  allNumbers: "All #",
};

export const BET_CATALOG = {
  line: ["pass", "passOdds", "dontPass", "dontPassOdds", "come", "dontCome"],
  place: ["place6", "place8", "place5", "place9", "place4", "place10", "buy4", "buy10"],
  props: ["field", "any7", "anyCraps", "yo", "boxcars", "aces", "horn", "ce"],
  bonus: ["hardway6", "hardway8", "hardway4", "hardway10", "allSmall", "allTall", "allNumbers"],
};

export const ALL_CATALOG_KEYS = Object.values(BET_CATALOG).flat();
export const DEFAULT_FAVORITES = ["pass", "passOdds", "place6", "place8", "come", "field"];

const validKey = (key) => ALL_CATALOG_KEYS.includes(key);

export function normalizeFavorites(slots) {
  const cleaned = (Array.isArray(slots) ? slots : []).filter(validKey);
  while (cleaned.length < SLOT_COUNT) {
    const fallback = DEFAULT_FAVORITES[cleaned.length];
    cleaned.push(fallback && !cleaned.includes(fallback) ? fallback : ALL_CATALOG_KEYS.find((k) => !cleaned.includes(k)) || "pass");
  }
  return cleaned.slice(0, SLOT_COUNT);
}

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_FAVORITES];
    return normalizeFavorites(JSON.parse(raw));
  } catch {
    return [...DEFAULT_FAVORITES];
  }
}

export function saveFavorites(slots) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeFavorites(slots)));
  } catch {
    // ignore quota / private mode
  }
}

export function assignFavoriteSlot(slots, slotIndex, key) {
  const next = [...normalizeFavorites(slots)];
  const existingIdx = next.indexOf(key);
  if (existingIdx >= 0 && existingIdx !== slotIndex) {
    next[existingIdx] = next[slotIndex];
  }
  next[slotIndex] = key;
  return normalizeFavorites(next);
}

export function isBonusKey(key) {
  return key === "allSmall" || key === "allTall" || key === "allNumbers";
}

export function getFavoriteBetAmount(key, { bets, allSmallBet, allTallBet, allNumbersBet }) {
  if (key === "allSmall") return allSmallBet;
  if (key === "allTall") return allTallBet;
  if (key === "allNumbers") return allNumbersBet;
  return bets[key] || 0;
}

export function isFavoriteBetDisabled(key, { phase, point, bets, maxOdds }) {
  if (key === "pass" || key === "dontPass") {
    return phase === "point" && bets[key] === 0;
  }
  if (key === "passOdds") {
    return bets.pass === 0 || phase === "comeout" || (point && bets.passOdds >= getMaxOddsAmt(maxOdds, bets.pass, point));
  }
  if (key === "dontPassOdds") {
    return bets.dontPass === 0 || phase === "comeout" || (point && bets.dontPassOdds >= getMaxOddsAmt(maxOdds, bets.dontPass, point));
  }
  if (key === "come" || key === "dontCome") {
    return phase === "comeout";
  }
  if (key.startsWith("place") || key === "buy4" || key === "buy10") {
    return phase === "comeout";
  }
  return false;
}
