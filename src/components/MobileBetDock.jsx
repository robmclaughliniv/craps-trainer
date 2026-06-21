import BetPanel from "./BetPanel.jsx";

const sheetButtons = [
  { id: "position", label: "Position", icon: "📊" },
  { id: "coach", label: "Coach", icon: "🎯" },
  { id: "history", label: "History", icon: "📜" },
];

export default function MobileBetDock({
  pnl_,
  tab,
  setTab,
  bets,
  placeBet,
  removeBet,
  phase,
  point,
  maxOdds,
  comePoints,
  dontComePoints,
  bankroll,
  setBankroll,
  allSmallBet,
  setAllSmallBet,
  allTallBet,
  setAllTallBet,
  allNumbersBet,
  setAllNumbersBet,
  allSmallHits,
  setAllSmallHits,
  allTallHits,
  setAllTallHits,
  allNumbersHits,
  setAllNumbersHits,
  buyVigPolicy,
  fieldPayOn12,
  activeSheet,
  onOpenSheet,
}) {
  return (
    <div style={{
      flexShrink: 0,
      background: "#0d0d18",
      borderTop: "1px solid rgba(255,255,255,.08)",
      paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      boxShadow: "0 -4px 24px rgba(0,0,0,.4)",
    }}>
      <div style={{ display: "flex", gap: 6, padding: "8px 12px 0" }}>
        {sheetButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => onOpenSheet(btn.id)}
            style={{
              flex: 1,
              minHeight: 40,
              padding: "6px 4px",
              borderRadius: 8,
              fontSize: 11,
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

      <BetPanel
        pnl_={pnl_}
        tab={tab}
        setTab={setTab}
        bets={bets}
        placeBet={placeBet}
        removeBet={removeBet}
        phase={phase}
        point={point}
        maxOdds={maxOdds}
        comePoints={comePoints}
        dontComePoints={dontComePoints}
        bankroll={bankroll}
        setBankroll={setBankroll}
        allSmallBet={allSmallBet}
        setAllSmallBet={setAllSmallBet}
        allTallBet={allTallBet}
        setAllTallBet={setAllTallBet}
        allNumbersBet={allNumbersBet}
        setAllNumbersBet={setAllNumbersBet}
        allSmallHits={allSmallHits}
        setAllSmallHits={setAllSmallHits}
        allTallHits={allTallHits}
        setAllTallHits={setAllTallHits}
        allNumbersHits={allNumbersHits}
        setAllNumbersHits={setAllNumbersHits}
        buyVigPolicy={buyVigPolicy}
        fieldPayOn12={fieldPayOn12}
        touch
        embeddedInDock
      />
    </div>
  );
}
