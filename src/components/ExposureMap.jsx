import { ROLL_PROB } from "../lib/betLogic.js";

export default function ExposureMap({
  pnl_,
  mono,
  maxOdds,
  comeTotal,
  dcTotal,
  totalBets,
  calcOutcome,
}) {
  const outcomes = [];
  for (let t = 2; t <= 12; t++) outcomes.push({ total: t, net: calcOutcome(t), prob: ROLL_PROB[t] / 36 });
  const maxAbs = Math.max(...outcomes.map((o) => Math.abs(o.net)), 1);
  const totalExposure = comeTotal + dcTotal + totalBets;
  if (totalExposure === 0) return null;

  const ev = outcomes.reduce((s, o) => s + o.net * o.prob, 0);
  const worstLoss = Math.min(...outcomes.map((o) => o.net));
  const bestWin = Math.max(...outcomes.map((o) => o.net));

  return (
    <div style={{ ...pnl_, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#666" }}>EXPOSURE MAP</span>
        <span style={{ fontSize: 10, fontFamily: mono, color: "#666" }}>Max Odds: {maxOdds === "345x" ? "3-4-5×" : maxOdds.replace("x", "×")}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, padding: "6px 8px", borderRadius: 6, background: "rgba(76,175,80,.06)", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#666", fontWeight: 600, letterSpacing: ".1em" }}>BEST ROLL</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#4caf50", fontFamily: mono }}>+${bestWin}</div>
        </div>
        <div style={{ flex: 1, padding: "6px 8px", borderRadius: 6, background: "rgba(244,67,54,.06)", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#666", fontWeight: 600, letterSpacing: ".1em" }}>WORST ROLL</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f44336", fontFamily: mono }}>{worstLoss >= 0 ? `+$${worstLoss}` : `-$${Math.abs(worstLoss)}`}</div>
        </div>
        <div style={{ flex: 1, padding: "6px 8px", borderRadius: 6, background: "rgba(33,150,243,.06)", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#666", fontWeight: 600, letterSpacing: ".1em" }}>EV / ROLL</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: ev >= 0 ? "#4caf50" : "#f44336", fontFamily: mono }}>{ev >= 0 ? "+" : ""}${ev.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {outcomes.map((o) => {
          const pct = maxAbs > 0 ? Math.abs(o.net) / maxAbs * 100 : 0;
          const isWin = o.net > 0;
          const isZero = o.net === 0;
          const color = isZero ? "#444" : isWin ? "#4caf50" : "#f44336";
          const probPct = (o.prob * 100).toFixed(1);
          return (
            <div key={o.total} style={{ display: "flex", alignItems: "center", gap: 0, height: 22 }}>
              <div style={{ width: 24, fontSize: 11, fontWeight: 700, color: o.total === 7 ? "#ff9800" : "#888", fontFamily: mono, textAlign: "right", paddingRight: 6 }}>{o.total}</div>
              <div style={{ width: 36, fontSize: 9, color: "#555", fontFamily: mono, textAlign: "right", paddingRight: 6 }}>{probPct}%</div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", height: 16, position: "relative" }}>
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,.08)" }} />
                {isWin ? (
                  <div style={{ position: "absolute", left: "50%", height: 12, borderRadius: "0 3px 3px 0", background: `${color}44`, border: `1px solid ${color}66`, borderLeft: "none", width: `${pct / 2}%`, transition: "width .3s" }} />
                ) : !isZero ? (
                  <div style={{ position: "absolute", right: "50%", height: 12, borderRadius: "3px 0 0 3px", background: `${color}44`, border: `1px solid ${color}66`, borderRight: "none", width: `${pct / 2}%`, transition: "width .3s" }} />
                ) : null}
              </div>
              <div style={{ width: 52, fontSize: 10, fontWeight: 600, color, fontFamily: mono, textAlign: "right" }}>
                {isZero ? "—" : isWin ? `+$${o.net}` : `-$${Math.abs(o.net)}`}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 9, color: "#555" }}>
        <span>← losses</span>
        <span>wins →</span>
      </div>
    </div>
  );
}
