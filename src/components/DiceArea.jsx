import Die from "./Die.jsx";

export default function DiceArea({
  isDesktop,
  die1,
  die2,
  rolling,
  rotationEnabled,
  shooterTagSlot,
  comePointPillsSlot,
  rollButtonSlot,
  lastLogEntry,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: isDesktop ? "32px 16px 24px" : "24px 16px 16px", background: "radial-gradient(ellipse at center,rgba(30,60,30,.3) 0%,transparent 70%)" }}>
      <div style={{ display: "flex", gap: isDesktop ? 20 : 16, marginBottom: 16 }}>
        <Die value={die1} rolling={rolling} size={isDesktop ? 92 : 72} />
        <Die value={die2} rolling={rolling} delay={0.08} size={isDesktop ? 92 : 72} />
      </div>
      <div style={{ fontSize: 13, color: "#888", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
        Total: <span style={{ color: "#fff", fontWeight: 700, fontSize: isDesktop ? 24 : 18 }}>{die1 + die2}</span>
      </div>
      {rotationEnabled && <div style={{ marginBottom: 12 }}>{shooterTagSlot}</div>}
      {comePointPillsSlot}
      {rollButtonSlot}
      {lastLogEntry && (
        <div style={{ marginTop: 12, padding: "6px 14px", borderRadius: 6, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.04)", maxWidth: isDesktop ? 480 : 360, textAlign: "center", animation: "fadeIn .3s ease-out" }}>
          <div style={{
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.4,
            color: lastLogEntry.type === "win" ? "#4caf50" : lastLogEntry.type === "lose" ? "#f44336" : lastLogEntry.type === "point" ? "#ff9800" : "#777",
          }}>{lastLogEntry.msg}</div>
        </div>
      )}
    </div>
  );
}
