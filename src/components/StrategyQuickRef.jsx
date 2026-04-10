export default function StrategyQuickRef({ pnl_, showStrategy, setShowStrategy }) {
  return (
    <div>
      <button onClick={() => setShowStrategy(!showStrategy)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, ...pnl_, color: "#888", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>📊 Strategy Quick Ref</span><span style={{ fontSize: 10 }}>{showStrategy ? "▲" : "▼"}</span>
      </button>
      {showStrategy && (
        <div style={{ ...pnl_, borderRadius: "0 0 8px 8px", borderTop: "none", padding: 12, fontSize: 12, lineHeight: 1.7, color: "#999" }}>
          <div style={{ color: "#4caf50", fontWeight: 600, marginBottom: 4 }}>THE SMART PLAY</div>
          <div>Pass/Come + max odds = lowest house edge.</div>
          <div>Place 6 & 8 = best place bets (1.52%).</div>
          <div style={{ color: "#ffc107", fontWeight: 600, marginTop: 8, marginBottom: 4 }}>THE OKAY PLAY</div>
          <div>Field = 5.56%. Place 5/9 = 4%.</div>
          <div style={{ color: "#f44336", fontWeight: 600, marginTop: 8, marginBottom: 4 }}>THE SUCKER PLAY</div>
          <div>Props, hardways = casino&apos;s rent money.</div>
          <div>Any 7 at 16.67% is the worst bet on the table.</div>
        </div>
      )}
    </div>
  );
}
