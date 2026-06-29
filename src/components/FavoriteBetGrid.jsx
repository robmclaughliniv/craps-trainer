import {
  SHORT_LABELS,
  getFavoriteBetAmount,
  isFavoriteBetDisabled,
  isBonusKey,
} from "../lib/favoriteBets.js";
import { ratingColor, getBetAddAmount } from "../lib/betLogic.js";
import { HOUSE_EDGES } from "../lib/betLogic.js";

function ActionBtn({ onClick, disabled, color, children, compact }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        minHeight: compact ? 32 : 44,
        fontSize: compact ? 15 : 18,
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
  tableMin,
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
  compact = false,
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
        const addAmt = isBonusKey(key) ? 5 : getBetAddAmount(key, tableMin, amount);

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
                  compact={compact}
                  onClick={() => handleAdd(key)}
                  disabled={disabled || bankroll < addAmt}
                  color="#4caf50"
                >
                  +
                </ActionBtn>
                <ActionBtn
                  compact={compact}
                  onClick={() => handleRemove(key)}
                  disabled={removeDisabled || amount <= 0}
                  color="#f44336"
                >
                  −
                </ActionBtn>
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
