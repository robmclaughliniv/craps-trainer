import { describe, it, expect, beforeEach } from "vitest";
import {
  normalizeFavorites,
  assignFavoriteSlot,
  DEFAULT_FAVORITES,
  SLOT_COUNT,
  isFavoriteBetDisabled,
  getFavoriteBetAmount,
} from "./favoriteBets.js";

describe("favoriteBets", () => {
  it("normalizes to exactly 6 valid slots", () => {
    const result = normalizeFavorites(["pass", "place6"]);
    expect(result).toHaveLength(SLOT_COUNT);
    expect(result[0]).toBe("pass");
    expect(result[1]).toBe("place6");
  });

  it("uses defaults when input is empty", () => {
    expect(normalizeFavorites([])).toEqual(normalizeFavorites(DEFAULT_FAVORITES));
  });

  it("swaps when assigning a bet already in another slot", () => {
    const slots = [...DEFAULT_FAVORITES];
    const next = assignFavoriteSlot(slots, 0, "field");
    expect(next[0]).toBe("field");
    expect(next).toContain("pass");
    expect(new Set(next).size).toBe(SLOT_COUNT);
  });

  it("disables place bets on comeout", () => {
    expect(isFavoriteBetDisabled("place6", { phase: "comeout", point: null, bets: {}, maxOdds: "345x" })).toBe(true);
    expect(isFavoriteBetDisabled("place6", { phase: "point", point: 6, bets: {}, maxOdds: "345x" })).toBe(false);
  });

  it("reads bonus bet amounts", () => {
    expect(getFavoriteBetAmount("allSmall", { bets: {}, allSmallBet: 15, allTallBet: 0, allNumbersBet: 0 })).toBe(15);
    expect(getFavoriteBetAmount("pass", { bets: { pass: 20 }, allSmallBet: 0, allTallBet: 0, allNumbersBet: 0 })).toBe(20);
  });
});
