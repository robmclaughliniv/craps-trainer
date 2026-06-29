import { useState, useCallback } from "react";

export const STORAGE_KEY = "craps-trainer:auto-pass-line";

export function loadAutoPassLine() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    if (raw === "true") return true;
    if (raw === "false") return false;
    const parsed = JSON.parse(raw);
    if (parsed === true) return true;
    if (parsed === false) return false;
    return true;
  } catch {
    return true;
  }
}

export function saveAutoPassLine(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled === true));
  } catch {
    // ignore quota / private mode
  }
}

export default function useAutoPassLine() {
  const [enabled, setEnabledState] = useState(loadAutoPassLine);

  const setEnabled = useCallback((value) => {
    const next = value === true;
    setEnabledState(next);
    saveAutoPassLine(next);
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      saveAutoPassLine(next);
      return next;
    });
  }, []);

  return { enabled, setEnabled, toggle };
}
