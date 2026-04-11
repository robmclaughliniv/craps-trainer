import { STRATS, getStrategySteps } from "../lib/strategies.js";

function Step({ done, active, text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0" }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
        background: done ? "rgba(76,175,80,.2)" : active ? "rgba(255,152,0,.2)" : "rgba(255,255,255,.03)",
        border: `1.5px solid ${done ? "#4caf50" : active ? "#ff9800" : "#333"}`,
        fontSize: 10, color: done ? "#4caf50" : active ? "#ff9800" : "#555", fontWeight: 700,
      }}>{done ? "✓" : active ? "→" : ""}</div>
      <span style={{ fontSize: 12, lineHeight: 1.4, color: done ? "#666" : active ? "#e0e0e0" : "#555", textDecoration: done ? "line-through" : "none" }}>{text}</span>
    </div>
  );
}

export default function StrategyGuide({
  pnl_,
  activeStrategy,
  setActiveStrategy,
  bets,
  phase,
  point,
  betUnit,
  comePoints,
  maxOdds,
  bankroll,
  tableMin,
}) {
  const steps = getStrategySteps(activeStrategy, { bets, phase, point, betUnit, comePoints, maxOdds });
  const selectedStrat = activeStrategy && STRATS.find((s) => s.id === activeStrategy);
  const units = tableMin > 0 ? Math.floor(bankroll / tableMin) : 0;

  return (
    <div style={{ ...pnl_, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#666" }}>STRATEGY</span>
        {activeStrategy && <button onClick={() => setActiveStrategy(null)} style={{ fontSize: 9, color: "#555", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>clear</button>}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: steps ? 10 : 0 }}>
        {STRATS.map((s) => (
          <button key={s.id} onClick={() => setActiveStrategy(activeStrategy === s.id ? null : s.id)} style={{
            flex: 1, padding: "6px 4px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer",
            textAlign: "center", lineHeight: 1.3, transition: "all .2s",
            background: activeStrategy === s.id ? `${s.color}15` : "rgba(255,255,255,.02)",
            color: activeStrategy === s.id ? s.color : "#666",
            border: `1px solid ${activeStrategy === s.id ? `${s.color}33` : "rgba(255,255,255,.06)"}`,
          }}>
            <div>{s.label}</div>
            <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>{s.short}</div>
          </button>
        ))}
      </div>

      {selectedStrat && units < selectedStrat.minUnits && (
        <div style={{ fontSize: 11, color: "#ff9800", padding: "4px 0 6px", lineHeight: 1.4 }}>
          {selectedStrat.label} typically needs {selectedStrat.minUnits}&times; table min (${tableMin * selectedStrat.minUnits} at ${tableMin} tables). You have {units} units. Consider Conservative or Smart Fun instead.
        </div>
      )}

      {steps && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,.04)", paddingTop: 8 }}>
          {steps.map((s, i) => <Step key={i} {...s} />)}
          {activeStrategy === "veteran" && (
            <div style={{ fontSize: 11, color: "#ff9800", fontStyle: "italic", padding: "6px 0 0" }}>
              Coverage tax: roughly $1.20 per decision more than Pass+Odds. You&apos;re trading EV for entertainment density. Smart Fun is the lower-cost alternative.
            </div>
          )}
        </div>
      )}

      {!activeStrategy && <div style={{ fontSize: 11, color: "#444", fontStyle: "italic", textAlign: "center", paddingTop: 4 }}>Pick a strategy to see your playbook</div>}
    </div>
  );
}
