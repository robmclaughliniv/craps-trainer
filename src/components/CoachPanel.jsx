export default function CoachPanel({
  pnl_,
  coachAdvice,
  coachLoading,
  coachEnabled,
  setCoachAdvice,
  setCoachEnabled,
  askCoach,
  buildSnapshot,
}) {
  return (
    <div style={{ ...pnl_, border: `1px solid ${coachAdvice && !coachLoading ? "rgba(76,175,80,.15)" : "rgba(255,255,255,.06)"}`, transition: "border-color .3s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: coachAdvice || coachLoading ? "1px solid rgba(255,255,255,.04)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>{coachLoading ? "⏳" : "🧠"}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#e0e0e0", letterSpacing: ".05em" }}>INSTINCT COACH</span>
          {coachLoading && <span style={{ fontSize: 10, color: "#4caf50", fontWeight: 600 }}>working…</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { setCoachAdvice(null); askCoach(buildSnapshot()); }} disabled={coachLoading} style={{ padding: "3px 10px", fontSize: 10, borderRadius: 4, background: "rgba(76,175,80,.12)", color: "#4caf50", border: "1px solid rgba(76,175,80,.25)", cursor: coachLoading ? "wait" : "pointer", fontWeight: 600, letterSpacing: ".05em" }}>ASK</button>
          <button onClick={() => setCoachEnabled(!coachEnabled)} style={{ padding: "3px 8px", fontSize: 10, borderRadius: 4, background: coachEnabled ? "rgba(76,175,80,.1)" : "rgba(255,255,255,.03)", color: coachEnabled ? "#4caf50" : "#555", border: `1px solid ${coachEnabled ? "rgba(76,175,80,.2)" : "rgba(255,255,255,.06)"}`, cursor: "pointer", fontWeight: 600 }}>{coachEnabled ? "AUTO" : "OFF"}</button>
        </div>
      </div>
      {coachLoading && <div style={{ padding: "12px 14px", textAlign: "center" }}><div style={{ fontSize: 12, color: "#4caf50" }}>Analyzing your table…</div></div>}
      {coachAdvice && !coachLoading && (
        <div style={{ padding: "12px 14px", animation: "fadeIn .4s ease-out" }}>
          {coachAdvice.instinct && <div style={{ marginBottom: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,152,0,.08)", border: "1px solid rgba(255,152,0,.15)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#ff9800", letterSpacing: ".15em", marginBottom: 5 }}>🎯 BUILD THIS INSTINCT</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.5 }}>{coachAdvice.instinct}</div>
            {coachAdvice.why && <div style={{ fontSize: 11, color: "#999", lineHeight: 1.4, marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,.04)" }}><span style={{ color: "#ff9800", fontWeight: 600 }}>Why: </span>{coachAdvice.why}</div>}
          </div>}
          {coachAdvice.action && <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6, marginBottom: 8, padding: "8px 10px", background: "rgba(76,175,80,.06)", borderRadius: 6, borderLeft: "3px solid #4caf50" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#4caf50", letterSpacing: ".1em", display: "block", marginBottom: 3 }}>RIGHT NOW</span>
            {coachAdvice.action}
          </div>}
          <div style={{ display: "flex", gap: 8, marginBottom: coachAdvice.warnings && coachAdvice.warnings !== "null" ? 8 : 0 }}>
            <div style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: coachAdvice.risk === "low" ? "rgba(76,175,80,.08)" : coachAdvice.risk === "medium" ? "rgba(255,193,7,.08)" : coachAdvice.risk === "high" ? "rgba(255,152,0,.08)" : "rgba(244,67,54,.08)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: coachAdvice.risk === "low" ? "#4caf50" : coachAdvice.risk === "medium" ? "#ffc107" : coachAdvice.risk === "high" ? "#ff9800" : "#f44336" }}>RISK: {coachAdvice.risk?.toUpperCase()}</div>
              <div style={{ fontSize: 10, color: "#888", lineHeight: 1.3, marginTop: 2 }}>{coachAdvice.risk_note}</div>
            </div>
          </div>
          {coachAdvice.warnings && coachAdvice.warnings !== "null" && <div style={{ fontSize: 11, color: "#ff9800", lineHeight: 1.4, padding: "6px 8px", borderRadius: 6, background: "rgba(255,152,0,.06)", borderLeft: "3px solid rgba(255,152,0,.3)" }}><span style={{ fontSize: 10, fontWeight: 700 }}>⚠️ </span>{coachAdvice.warnings}</div>}
        </div>
      )}
      {!coachAdvice && !coachLoading && <div style={{ padding: "14px", textAlign: "center" }}><div style={{ fontSize: 12, color: "#444", fontStyle: "italic" }}>Roll the dice — coach builds your instincts after each roll</div></div>}
    </div>
  );
}
