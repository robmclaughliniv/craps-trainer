import { useState } from "react";

export default function ResizeHandle({ side, onPointerDown, onDoubleClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={side === "left" ? "Resize bets panel" : "Resize intelligence panel"}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 6,
        flexShrink: 0,
        cursor: "col-resize",
        alignSelf: "stretch",
        background: hovered ? "rgba(76,175,80,.25)" : "rgba(255,255,255,.06)",
        transition: hovered ? "none" : "background .15s",
        touchAction: "none",
      }}
    />
  );
}
