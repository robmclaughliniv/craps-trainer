import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  STORAGE_KEY,
  loadAutoPassLine,
  saveAutoPassLine,
} from "../hooks/useAutoPassLine.js";

describe("auto pass line storage", () => {
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
    expect(loadAutoPassLine()).toBe(true);
  });

  it("loads stored false value", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(false));
    expect(loadAutoPassLine()).toBe(false);
  });

  it("falls back to true for invalid stored value", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify("yes"));
    expect(loadAutoPassLine()).toBe(true);
  });

  it("persists enabled state via saveAutoPassLine", () => {
    saveAutoPassLine(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toBe(true);
  });
});
