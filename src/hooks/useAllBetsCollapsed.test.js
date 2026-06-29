import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  STORAGE_KEY,
  loadAllBetsCollapsed,
  saveAllBetsCollapsed,
} from "../hooks/useAllBetsCollapsed.js";

describe("all bets collapsed storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      store: {},
      getItem(key) {
        return this.store[key] ?? null;
      },
      setItem(key, value) {
        this.store[key] = value;
      },
    });
    localStorage.store = {};
  });

  it("returns true when nothing is stored", () => {
    expect(loadAllBetsCollapsed()).toBe(true);
  });

  it("loads stored false value", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(false));
    expect(loadAllBetsCollapsed()).toBe(false);
  });

  it("falls back to true for invalid stored value", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify("yes"));
    expect(loadAllBetsCollapsed()).toBe(true);
  });

  it("persists collapsed state via saveAllBetsCollapsed", () => {
    saveAllBetsCollapsed(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toBe(true);
  });
});
