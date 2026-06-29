import { useState } from "react";

export default function IntelligencePanelToggle({ direction, onClick, title, compact = false, style }) {
  const [hovered, setHovered] = useState(false);
  const chevron = direction === "collapse" ? "›" : "‹";

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: compact ? 32 : 28,
        height: compact ? 32 : 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        padding: 0,
        fontSize: compact ? 18 : 16,
        lineHeight: 1,
        color: hovered ? "#4caf50" : "#888",
        background: compact ? "#12121f" : "transparent",
        border: compact
          ? `1px solid ${hovered ? "rgba(76,175,80,.4)" : "rgba(255,255,255,.08)"}`
          : `1px solid ${hovered ? "rgba(76,175,80,.35)" : "transparent"}`,
        borderRadius: compact ? 8 : 6,
        cursor: "pointer",
        boxShadow: compact ? "0 2px 8px rgba(0,0,0,.35)" : "none",
        transition: "color .15s, border-color .15s, background .15s",
        ...style,
      }}
    >
      {chevron}
    </button>
  );
}
