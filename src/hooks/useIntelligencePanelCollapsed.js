import { useState, useCallback } from "react";

export const STORAGE_KEY = "craps-trainer:intelligence-collapsed";

export function loadIntelligenceCollapsed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return false;
    if (raw === "true") return true;
    if (raw === "false") return false;
    const parsed = JSON.parse(raw);
    return parsed === true;
  } catch {
    return false;
  }
}

export function saveIntelligenceCollapsed(collapsed) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed === true));
  } catch {
    // ignore quota / private mode
  }
}

export default function useIntelligencePanelCollapsed() {
  const [collapsed, setCollapsed] = useState(loadIntelligenceCollapsed);

  const collapse = useCallback(() => {
    setCollapsed(true);
    saveIntelligenceCollapsed(true);
  }, []);

  const expand = useCallback(() => {
    setCollapsed(false);
    saveIntelligenceCollapsed(false);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      saveIntelligenceCollapsed(next);
      return next;
    });
  }, []);

  return { collapsed, collapse, expand, toggle };
}
