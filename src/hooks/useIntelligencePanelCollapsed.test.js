import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  STORAGE_KEY,
  loadIntelligenceCollapsed,
  saveIntelligenceCollapsed,
} from "../hooks/useIntelligencePanelCollapsed.js";

describe("intelligence panel collapsed storage", () => {
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

  it("returns false when nothing is stored", () => {
    expect(loadIntelligenceCollapsed()).toBe(false);
  });

  it("loads stored true value", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(true));
    expect(loadIntelligenceCollapsed()).toBe(true);
  });

  it("falls back to false for invalid stored value", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify("yes"));
    expect(loadIntelligenceCollapsed()).toBe(false);
  });

  it("persists collapsed state via saveIntelligenceCollapsed", () => {
    saveIntelligenceCollapsed(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toBe(true);
  });
});
