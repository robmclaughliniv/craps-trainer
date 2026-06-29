import { useState, useCallback, useRef, useEffect } from "react";

export const STORAGE_KEY = "craps-trainer:column-widths";
export const DEFAULT_COLUMN_WIDTHS = { left: 320, right: 380 };

const MIN_LEFT = 240;
const MIN_RIGHT = 280;
const MIN_CENTER = 360;
const HANDLE_WIDTH = 6;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeWidths(raw) {
  const left = Number(raw?.left);
  const right = Number(raw?.right);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
  if (left < MIN_LEFT || right < MIN_RIGHT) return null;
  return { left, right };
}

export function loadColumnWidths() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_COLUMN_WIDTHS };
    return normalizeWidths(JSON.parse(raw)) ?? { ...DEFAULT_COLUMN_WIDTHS };
  } catch {
    return { ...DEFAULT_COLUMN_WIDTHS };
  }
}

export function saveColumnWidths(widths) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  } catch {
    // ignore quota / private mode
  }
}

function getMaxSideWidth(containerWidth, otherSideWidth) {
  const maxByRatio = containerWidth * 0.45;
  const maxByCenter = containerWidth - otherSideWidth - MIN_CENTER - HANDLE_WIDTH * 2;
  return Math.max(MIN_LEFT, Math.min(maxByRatio, maxByCenter));
}

export default function useColumnWidths(containerRef) {
  const [widths, setWidths] = useState(loadColumnWidths);
  const dragRef = useRef(null);

  const getContainerWidth = useCallback(() => {
    return containerRef.current?.getBoundingClientRect().width ?? window.innerWidth;
  }, [containerRef]);

  const clampLeft = useCallback(
    (left, right) => {
      const containerWidth = getContainerWidth();
      const max = getMaxSideWidth(containerWidth, right);
      return clamp(left, MIN_LEFT, max);
    },
    [getContainerWidth]
  );

  const clampRight = useCallback(
    (right, left) => {
      const containerWidth = getContainerWidth();
      const max = getMaxSideWidth(containerWidth, left);
      return clamp(right, MIN_RIGHT, max);
    },
    [getContainerWidth]
  );

  const endDrag = useCallback(() => {
    document.body.classList.remove("col-resize-active");
    dragRef.current = null;
  }, []);

  useEffect(() => {
    const onPointerMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.side === "left") {
        const delta = e.clientX - drag.startX;
        const nextLeft = clampLeft(drag.startWidth + delta, drag.otherWidth);
        setWidths((prev) => ({ ...prev, left: nextLeft }));
      } else {
        const delta = drag.startX - e.clientX;
        const nextRight = clampRight(drag.startWidth + delta, drag.otherWidth);
        setWidths((prev) => ({ ...prev, right: nextRight }));
      }
    };

    const onPointerUp = () => {
      const drag = dragRef.current;
      if (!drag) return;
      setWidths((prev) => {
        saveColumnWidths(prev);
        return prev;
      });
      endDrag();
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      document.body.classList.remove("col-resize-active");
    };
  }, [clampLeft, clampRight, endDrag]);

  const startLeftResize = useCallback(
    (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      document.body.classList.add("col-resize-active");
      dragRef.current = {
        side: "left",
        startX: e.clientX,
        startWidth: widths.left,
        otherWidth: widths.right,
      };
    },
    [widths.left, widths.right]
  );

  const startRightResize = useCallback(
    (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      document.body.classList.add("col-resize-active");
      dragRef.current = {
        side: "right",
        startX: e.clientX,
        startWidth: widths.right,
        otherWidth: widths.left,
      };
    },
    [widths.left, widths.right]
  );

  const resetLeft = useCallback(() => {
    setWidths((prev) => {
      const next = { ...prev, left: DEFAULT_COLUMN_WIDTHS.left };
      saveColumnWidths(next);
      return next;
    });
  }, []);

  const resetRight = useCallback(() => {
    setWidths((prev) => {
      const next = { ...prev, right: DEFAULT_COLUMN_WIDTHS.right };
      saveColumnWidths(next);
      return next;
    });
  }, []);

  return {
    leftWidth: widths.left,
    rightWidth: widths.right,
    startLeftResize,
    startRightResize,
    resetLeft,
    resetRight,
  };
}
