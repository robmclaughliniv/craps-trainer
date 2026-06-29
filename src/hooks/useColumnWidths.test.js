import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  STORAGE_KEY,
  DEFAULT_COLUMN_WIDTHS,
  loadColumnWidths,
  saveColumnWidths,
} from "../hooks/useColumnWidths.js";

describe("column widths storage", () => {
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

  it("returns defaults when nothing is stored", () => {
    expect(loadColumnWidths()).toEqual(DEFAULT_COLUMN_WIDTHS);
  });

  it("loads valid stored widths", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ left: 400, right: 420 }));
    expect(loadColumnWidths()).toEqual({ left: 400, right: 420 });
  });

  it("falls back to defaults for invalid stored widths", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ left: 100, right: 420 }));
    expect(loadColumnWidths()).toEqual(DEFAULT_COLUMN_WIDTHS);
  });

  it("persists widths via saveColumnWidths", () => {
    saveColumnWidths({ left: 360, right: 400 });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({ left: 360, right: 400 });
  });
});
