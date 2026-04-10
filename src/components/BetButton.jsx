import { ratingColor } from "../lib/betLogic.js";
import Badge from "./Badge.jsx";

export default function BetButton({ label, he, amount, onBet, onRemove, disabled, mini }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: mini ? "4px 0" : "6px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: mini ? 12 : 13, color: amount > 0 ? "#e0e0e0" : "#888",
          fontWeight: amount > 0 ? 600 : 400,
        }}>
          {label} {amount > 0 && <span style={{ color: ratingColor(he) }}>${amount}</span>}
        </div>
      </div>
      <Badge he={he} />
      <div style={{ display: "flex", gap: 3 }}>
        <button onClick={onBet} disabled={disabled} style={{
          padding: "3px 10px", fontSize: 11, borderRadius: 4,
          background: disabled ? "#333" : "rgba(76,175,80,0.2)", color: disabled ? "#555" : "#4caf50",
          border: `1px solid ${disabled ? "#444" : "rgba(76,175,80,0.3)"}`,
          cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600,
        }}>+</button>
        {amount > 0 && (
          <button onClick={onRemove} style={{
            padding: "3px 10px", fontSize: 11, borderRadius: 4,
            background: "rgba(244,67,54,0.15)", color: "#f44336",
            border: "1px solid rgba(244,67,54,0.3)", cursor: "pointer", fontWeight: 600,
          }}>−</button>
        )}
      </div>
    </div>
  );
}
