import {
  SHORT_LABELS,
  getFavoriteBetAmount,
  isFavoriteBetDisabled,
  isBonusKey,
} from "../lib/favoriteBets.js";
import { ratingColor } from "../lib/betLogic.js";
import { HOUSE_EDGES } from "../lib/betLogic.js";

function ActionBtn({ onClick, disabled, color, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        minHeight: 44,
        fontSize: 18,
        fontWeight: 700,
        borderRadius: 8,
        background: disabled ? "#222" : `${color}22`,
        color: disabled ? "#444" : color,
        border: `1px solid ${disabled ? "#333" : `${color}55`}`,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function FavoriteBetGrid({
  favoriteSlots,
  bets,
  phase,
  point,
  maxOdds,
  bankroll,
  betUnit,
  allSmallBet,
  allTallBet,
  allNumbersBet,
  placeBet,
  removeBet,
  onBonusBet,
  onBonusRemove,
  editing,
  onSlotTap,
  mono,
}) {
  const gameState = { phase, point, bets, maxOdds };

  const handleAdd = (key) => {
    if (isBonusKey(key)) {
      onBonusBet(key);
      return;
    }
    placeBet(key);
  };

  const handleRemove = (key) => {
    if (isBonusKey(key)) {
      onBonusRemove(key);
      return;
    }
    removeBet(key);
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 8,
      padding: "8px 12px 12px",
    }}>
      {favoriteSlots.map((key, idx) => {
        const amount = getFavoriteBetAmount(key, { bets, allSmallBet, allTallBet, allNumbersBet });
        const disabled = isFavoriteBetDisabled(key, gameState);
        const he = HOUSE_EDGES[key] ?? (key.includes("Odds") ? HOUSE_EDGES.odds : undefined);
        const label = SHORT_LABELS[key] || key;
        const removeDisabled = amount <= 0
          || ((key === "pass" || key === "dontPass") && phase === "point");

        return (
          <div
            key={idx}
            onClick={editing ? () => onSlotTap(idx) : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "8px 6px",
              borderRadius: 10,
              background: editing ? "rgba(76,175,80,.06)" : "rgba(255,255,255,.03)",
              border: editing ? "1px dashed rgba(76,175,80,.4)" : "1px solid rgba(255,255,255,.06)",
              cursor: editing ? "pointer" : "default",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: amount > 0 ? "#e0e0e0" : "#888", lineHeight: 1.2 }}>
                {label}
              </div>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: mono,
                color: amount > 0 ? (he !== undefined ? ratingColor(he) : "#ff9800") : "#555",
                marginTop: 2,
              }}>
                {amount > 0 ? `$${amount}` : "—"}
              </div>
            </div>
            {!editing && (
              <div style={{ display: "flex", gap: 4 }}>
                <ActionBtn
                  onClick={() => handleAdd(key)}
                  disabled={disabled || (isBonusKey(key) ? bankroll < 5 : bankroll < betUnit)}
                  color="#4caf50"
                >
                  +
                </ActionBtn>
                {amount > 0 && (
                  <ActionBtn
                    onClick={() => handleRemove(key)}
                    disabled={removeDisabled}
                    color="#f44336"
                  >
                    −
                  </ActionBtn>
                )}
              </div>
            )}
            {editing && (
              <div style={{ fontSize: 9, textAlign: "center", color: "#4caf50", fontWeight: 600 }}>
                Tap to change
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
