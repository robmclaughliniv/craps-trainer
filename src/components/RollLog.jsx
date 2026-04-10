import { forwardRef } from "react";

const RollLog = forwardRef(function RollLog({ height = 160, log, mono }, ref) {
  return (
    <div ref={ref} style={{ background: "#0d0d18", borderRadius: 8, padding: 10, border: "1px solid rgba(255,255,255,.04)", height, overflowY: "auto" }}>
      {log.length === 0 ? <div style={{ color: "#444", fontSize: 12, textAlign: "center", paddingTop: 20, fontStyle: "italic" }}>Place your bets and roll the dice…</div>
        : [...log].reverse().map((e) => (
          <div key={e.id} style={{ fontSize: 11, padding: "3px 0", color: e.type === "win" ? "#4caf50" : e.type === "lose" ? "#f44336" : e.type === "point" ? "#ff9800" : "#777", fontFamily: mono, animation: "fadeIn .3s ease-out", borderBottom: "1px solid rgba(255,255,255,.02)" }}>{e.msg}</div>
        ))}
    </div>
  );
});

export default RollLog;
