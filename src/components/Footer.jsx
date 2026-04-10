export default function Footer({
  onEndSession,
  onReset,
  sessionWins,
  sessionLosses,
}) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onEndSession} style={{ padding: "8px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(76,175,80,.1)", color: "#4caf50", border: "1px solid rgba(76,175,80,.2)", cursor: "pointer" }}>End Session</button>
        <button onClick={onReset} style={{ padding: "8px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(244,67,54,.08)", color: "#f44336", border: "1px solid rgba(244,67,54,.15)", cursor: "pointer" }}>Reset</button>
      </div>
      <div style={{ fontSize: 11, color: "#555", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 12 }}>
        <span>Won: <span style={{ color: "#4caf50" }}>${sessionWins}</span></span>
        <span>Lost: <span style={{ color: "#f44336" }}>${sessionLosses}</span></span>
      </div>
    </div>
  );
}
