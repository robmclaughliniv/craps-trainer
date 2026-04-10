import { classifyBet } from "../lib/betLogic.js";

export default function BetEfficiency({
  pnl_,
  bets,
  comePoints,
  dontComePoints,
  buyVigPolicy,
  fieldPayOn12,
}) {
  const classOpts = { buyVigPolicy, fieldPayOn12 };
  const allRisk = [];
  Object.entries(bets).forEach(([k, v]) => { if (v > 0) allRisk.push({ key: k, amt: v, cat: classifyBet(k, classOpts) }); });
  comePoints.forEach((cp) => {
    allRisk.push({ key: `come_${cp.number}`, amt: cp.amount, cat: "smart" });
    if (cp.odds > 0) allRisk.push({ key: `comeOdds_${cp.number}`, amt: cp.odds, cat: "smart" });
  });
  dontComePoints.forEach((dp) => {
    allRisk.push({ key: `dc_${dp.number}`, amt: dp.amount, cat: "smart" });
    if (dp.odds > 0) allRisk.push({ key: `dcOdds_${dp.number}`, amt: dp.odds, cat: "smart" });
  });
  const smartAmt = allRisk.filter((r) => r.cat === "smart").reduce((s, r) => s + r.amt, 0);
  const okAmt = allRisk.filter((r) => r.cat === "ok").reduce((s, r) => s + r.amt, 0);
  const trashAmt = allRisk.filter((r) => r.cat === "trash").reduce((s, r) => s + r.amt, 0);
  const totalRisk = smartAmt + okAmt + trashAmt;
  if (totalRisk === 0) return null;

  const smartPct = Math.round(smartAmt / totalRisk * 100);
  const okPct = Math.round(okAmt / totalRisk * 100);
  const trashPct = 100 - smartPct - okPct;
  const grade = trashPct === 0 && smartPct >= 80 ? "A" : trashPct === 0 ? "B+" : trashPct <= 15 ? "B" : trashPct <= 30 ? "C" : trashPct <= 50 ? "D" : "F";
  const gradeColor = grade.startsWith("A") ? "#4caf50" : grade.startsWith("B") ? "#8bc34a" : grade === "C" ? "#ffc107" : grade === "D" ? "#ff9800" : "#f44336";

  return (
    <div style={{ ...pnl_, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#666" }}>BET EFFICIENCY</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: gradeColor, fontFamily: "'JetBrains Mono', monospace" }}>{grade}</span>
      </div>
      <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 8 }}>
        {smartPct > 0 && <div style={{ width: `${smartPct}%`, background: "#4caf50", transition: "width .3s" }} />}
        {okPct > 0 && <div style={{ width: `${okPct}%`, background: "#ffc107", transition: "width .3s" }} />}
        {trashPct > 0 && <div style={{ width: `${trashPct}%`, background: "#f44336", transition: "width .3s" }} />}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
        <span style={{ color: "#4caf50" }}>Smart ${smartAmt} ({smartPct}%)</span>
        {okAmt > 0 && <span style={{ color: "#ffc107" }}>OK ${okAmt} ({okPct}%)</span>}
        {trashAmt > 0 && <span style={{ color: "#f44336" }}>Trash ${trashAmt} ({trashPct}%)</span>}
      </div>
    </div>
  );
}
