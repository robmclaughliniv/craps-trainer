import ComePointActions from "./ComePointActions.jsx";
import FavoriteBetGrid from "./FavoriteBetGrid.jsx";

const sheetButtons = [
  { id: "position", label: "Position", icon: "📊" },
  { id: "coach", label: "Coach", icon: "🎯" },
  { id: "history", label: "History", icon: "📜" },
  { id: "allBets", label: "All Bets", icon: "🎰" },
  { id: "editFavorites", label: "Edit", icon: "⭐" },
];

export default function MobileBetDock({
  favoriteSlots,
  bets,
  placeBet,
  removeBet,
  onBonusBet,
  onBonusRemove,
  phase,
  point,
  maxOdds,
  comePoints,
  dontComePoints,
  bankroll,
  tableMin,
  allSmallBet,
  allTallBet,
  allNumbersBet,
  addComeOdds,
  removeComeOdds,
  addDcOdds,
  removeDcOdds,
  activeSheet,
  onOpenSheet,
  mono,
}) {
  return (
    <div style={{
      flexShrink: 0,
      background: "#0d0d18",
      borderTop: "1px solid rgba(255,255,255,.08)",
      paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      boxShadow: "0 -4px 24px rgba(0,0,0,.4)",
    }}>
      <div style={{ display: "flex", gap: 4, padding: "8px 8px 0", overflowX: "auto" }}>
        {sheetButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => onOpenSheet(btn.id)}
            style={{
              flex: "1 0 56px",
              minHeight: 40,
              padding: "6px 4px",
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 600,
              background: activeSheet === btn.id ? "rgba(76,175,80,.12)" : "rgba(255,255,255,.04)",
              color: activeSheet === btn.id ? "#4caf50" : "#888",
              border: `1px solid ${activeSheet === btn.id ? "rgba(76,175,80,.25)" : "rgba(255,255,255,.06)"}`,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{btn.icon}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      <ComePointActions
        comePoints={comePoints}
        dontComePoints={dontComePoints}
        maxOdds={maxOdds}
        bankroll={bankroll}
        tableMin={tableMin}
        addComeOdds={addComeOdds}
        removeComeOdds={removeComeOdds}
        addDcOdds={addDcOdds}
        removeDcOdds={removeDcOdds}
        mono={mono}
      />

      <FavoriteBetGrid
        favoriteSlots={favoriteSlots}
        bets={bets}
        phase={phase}
        point={point}
        maxOdds={maxOdds}
        bankroll={bankroll}
        tableMin={tableMin}
        allSmallBet={allSmallBet}
        allTallBet={allTallBet}
        allNumbersBet={allNumbersBet}
        placeBet={placeBet}
        removeBet={removeBet}
        onBonusBet={onBonusBet}
        onBonusRemove={onBonusRemove}
        editing={false}
        mono={mono}
      />
    </div>
  );
}
