import { ratingColor } from "../lib/betLogic.js";
import Badge from "./Badge.jsx";

export default function BetButton({ label, subLabel, he, perRollHe, amount, onBet, onRemove, disabled, mini, touch }) {
  const btnPad = touch ? "10px 16px" : "3px 10px";
  const btnMinH = touch ? 44 : undefined;
  const btnFont = touch ? 14 : 11;
  const btnRadius = touch ? 8 : 4;
  const rowPad = touch ? (mini ? "6px 0" : "8px 0") : (mini ? "4px 0" : "6px 0");
  const labelFont = touch ? (mini ? 13 : 14) : (mini ? 12 : 13);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: touch ? 8 : 6,
      padding: rowPad,
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: labelFont, color: amount > 0 ? "#e0e0e0" : "#888",
          fontWeight: amount > 0 ? 600 : 400,
        }}>
          {label} {amount > 0 && <span style={{ color: ratingColor(he) }}>${amount}</span>}
        </div>
        {subLabel && amount === 0 && (
          <div style={{ fontSize: touch ? 10 : 9, color: "#555", marginTop: 2 }}>{subLabel}</div>
        )}
      </div>
      <Badge he={he} perRollHe={perRollHe} />
      <div style={{ display: "flex", gap: touch ? 6 : 3 }}>
        <button onClick={onBet} disabled={disabled} style={{
          padding: btnPad, minHeight: btnMinH, minWidth: touch ? 44 : undefined,
          fontSize: btnFont, borderRadius: btnRadius,
          background: disabled ? "#333" : "rgba(76,175,80,0.2)", color: disabled ? "#555" : "#4caf50",
          border: `1px solid ${disabled ? "#444" : "rgba(76,175,80,0.3)"}`,
          cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600,
        }}>+</button>
        {amount > 0 && (
          <button onClick={onRemove} style={{
            padding: btnPad, minHeight: btnMinH, minWidth: touch ? 44 : undefined,
            fontSize: btnFont, borderRadius: btnRadius,
            background: "rgba(244,67,54,0.15)", color: "#f44336",
            border: "1px solid rgba(244,67,54,0.3)", cursor: "pointer", fontWeight: 600,
          }}>−</button>
        )}
      </div>
    </div>
  );
}
