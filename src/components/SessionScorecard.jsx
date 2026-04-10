export default function SessionScorecard({
  showScorecard,
  pnl_,
  betTracker,
  sessionStartRef,
  bankroll,
  startingBankroll,
  rollCount,
  sessionWins,
  sessionLosses,
  activeStrategy,
  onNewSession,
  onBack,
}) {
  if (!showScorecard) return null;
  const t = betTracker.current;
  const duration = Math.round((Date.now() - sessionStartRef.current) / 60000);
  const netResult = bankroll - startingBankroll;
  const totalBetsMade = t.total;
  const disciplinePct = totalBetsMade > 0 ? Math.round((t.onStrat / totalBetsMade) * 100) : 100;
  const smartPct = totalBetsMade > 0 ? Math.round((t.smart / totalBetsMade) * 100) : 0;
  const trashPct = totalBetsMade > 0 ? Math.round((t.trash / totalBetsMade) * 100) : 0;

  const grade = disciplinePct >= 90 && trashPct <= 5 ? "A" : disciplinePct >= 80 && trashPct <= 10 ? "B+" : disciplinePct >= 70 && trashPct <= 20 ? "B" : disciplinePct >= 50 ? "C" : "D";
  const gradeColor = grade.startsWith("A") ? "#4caf50" : grade.startsWith("B") ? "#8bc34a" : grade === "C" ? "#ffc107" : "#ff9800";

  let leak = "None — clean session.";
  if (t.trash > 0 && t.trashAmt > t.okAmt) leak = `Prop/hardway bets: ${t.trash} bets totaling $${t.trashAmt} in high-edge territory.`;
  else if (t.offStrat > t.total * 0.3 && activeStrategy) leak = `Went off-strategy ${t.offStrat} times — the system only works if you follow it.`;
  else if (t.ok > t.smart) leak = "More \"okay\" bets than smart ones — tighten up to Pass/Come + odds.";
  else if (t.trash > 0) leak = `${t.trash} trash bet${t.trash > 1 ? "s" : ""} ($${t.trashAmt}) — that's the casino's margin.`;

  const StatRow = ({ label, value, color = "#e0e0e0" }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
      <span style={{ fontSize: 12, color: "#888" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.8)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, ...pnl_, padding: 0, animation: "fadeIn .4s ease-out", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "20px 20px 12px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: gradeColor, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{grade}</div>
          <div style={{ fontSize: 11, color: "#666", fontWeight: 600, letterSpacing: ".1em", marginTop: 4 }}>SESSION GRADE</div>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 16, padding: "12px", borderRadius: 8, background: netResult >= 0 ? "rgba(76,175,80,.08)" : "rgba(244,67,54,.08)" }}>
            <div style={{ fontSize: 10, color: "#666", fontWeight: 600, letterSpacing: ".1em" }}>SESSION RESULT</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: netResult >= 0 ? "#4caf50" : "#f44336", fontFamily: "'JetBrains Mono', monospace" }}>{netResult >= 0 ? "+" : ""}{netResult}</div>
            <div style={{ fontSize: 11, color: "#888" }}>${startingBankroll} → ${bankroll}</div>
          </div>

          <StatRow label="Duration" value={`${duration} min`} />
          <StatRow label="Rolls" value={rollCount} />
          <StatRow label="Total bets placed" value={totalBetsMade} />
          <StatRow label="Won" value={`$${sessionWins}`} color="#4caf50" />
          <StatRow label="Lost" value={`$${sessionLosses}`} color="#f44336" />
          <StatRow label="Peak bankroll" value={`$${t.peak}`} color="#4caf50" />
          <StatRow label="Lowest bankroll" value={`$${t.trough}`} color="#ff9800" />
          <StatRow label="Strategy" value={activeStrategy ? activeStrategy.charAt(0).toUpperCase() + activeStrategy.slice(1) : "Freestyle"} />

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#666", marginBottom: 6 }}>DISCIPLINE</div>
            {activeStrategy && <StatRow label="On-strategy bets" value={`${disciplinePct}%`} color={disciplinePct >= 80 ? "#4caf50" : disciplinePct >= 60 ? "#ffc107" : "#f44336"} />}
            <StatRow label="Smart bets (≤1.5%)" value={`${t.smart} ($${t.smartAmt})`} color="#4caf50" />
            <StatRow label="OK bets (≤5%)" value={`${t.ok} ($${t.okAmt})`} color="#ffc107" />
            <StatRow label="Trash bets (>5%)" value={`${t.trash} ($${t.trashAmt})`} color={t.trash > 0 ? "#f44336" : "#4caf50"} />

            {totalBetsMade > 0 && (
              <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
                {smartPct > 0 && <div style={{ width: `${smartPct}%`, background: "#4caf50" }} />}
                {(100 - smartPct - trashPct) > 0 && <div style={{ width: `${100 - smartPct - trashPct}%`, background: "#ffc107" }} />}
                {trashPct > 0 && <div style={{ width: `${trashPct}%`, background: "#f44336" }} />}
              </div>
            )}
          </div>

          <div style={{ padding: "10px 12px", borderRadius: 6, background: "rgba(255,152,0,.06)", borderLeft: "3px solid rgba(255,152,0,.3)", marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#ff9800", letterSpacing: ".1em", marginBottom: 3 }}>BIGGEST LEAK</div>
            <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.4 }}>{leak}</div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onNewSession} style={{
              flex: 1, padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: "linear-gradient(135deg,#2e7d32,#4caf50)", color: "#fff", border: "none",
            }}>New Session</button>
            <button onClick={onBack} style={{
              padding: "12px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: "rgba(255,255,255,.05)", color: "#888", border: "1px solid rgba(255,255,255,.1)",
            }}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
