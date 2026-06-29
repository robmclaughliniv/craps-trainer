import { useState, useCallback } from "react";

export const STORAGE_KEY = "craps-trainer:all-bets-collapsed";

export function loadAllBetsCollapsed() {
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

export function saveAllBetsCollapsed(collapsed) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed === true));
  } catch {
    // ignore quota / private mode
  }
}

export default function useAllBetsCollapsed() {
  const [collapsed, setCollapsed] = useState(loadAllBetsCollapsed);

  const collapse = useCallback(() => {
    setCollapsed(true);
    saveAllBetsCollapsed(true);
  }, []);

  const expand = useCallback(() => {
    setCollapsed(false);
    saveAllBetsCollapsed(false);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      saveAllBetsCollapsed(next);
      return next;
    });
  }, []);

  return { collapsed, collapse, expand, toggle };
}
