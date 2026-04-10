export default function SetupScreen({
  CSS,
  pnl_,
  bankroll,
  setBankroll,
  startingBankroll,
  setStartingBankroll,
  betUnit,
  setBetUnit,
  maxOdds,
  setMaxOdds,
  setShowSetup,
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#e0e0e0", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{CSS}</style>
      <div style={{ width: "100%", maxWidth: 420, animation: "fadeIn .5s ease-out" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 14, letterSpacing: ".2em", color: "#4caf50", fontWeight: 600, marginBottom: 8 }}>CRAPS TRAINER</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Session Setup</div>
          <div style={{ fontSize: 13, color: "#666" }}>You&apos;re at a table with Mike, Sarah & Tom. Dice rotate on seven-outs.</div>
        </div>
        <div style={{ ...pnl_, padding: 28 }}>
          <label style={{ fontSize: 12, color: "#888", fontWeight: 600, letterSpacing: ".1em", display: "block", marginBottom: 8 }}>BANKROLL</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[200, 500, 1000, 2000].map((v) => (
              <button key={v} onClick={() => { setBankroll(v); setStartingBankroll(v); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", background: startingBankroll === v ? "rgba(76,175,80,.15)" : "rgba(255,255,255,.03)", color: startingBankroll === v ? "#4caf50" : "#888", border: `1px solid ${startingBankroll === v ? "rgba(76,175,80,.3)" : "rgba(255,255,255,.06)"}`, transition: "all .2s" }}>${v}</button>
            ))}
          </div>
          <label style={{ fontSize: 12, color: "#888", fontWeight: 600, letterSpacing: ".1em", display: "block", marginBottom: 8 }}>BET UNIT</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[5, 10, 15, 25].map((v) => (
              <button key={v} onClick={() => setBetUnit(v)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", background: betUnit === v ? "rgba(76,175,80,.15)" : "rgba(255,255,255,.03)", color: betUnit === v ? "#4caf50" : "#888", border: `1px solid ${betUnit === v ? "rgba(76,175,80,.3)" : "rgba(255,255,255,.06)"}`, transition: "all .2s" }}>${v}</button>
            ))}
          </div>
          <label style={{ fontSize: 12, color: "#888", fontWeight: 600, letterSpacing: ".1em", display: "block", marginBottom: 8 }}>MAX ODDS</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
            {[{ v: "1x", l: "1×" }, { v: "2x", l: "2×" }, { v: "345x", l: "3-4-5×" }, { v: "5x", l: "5×" }, { v: "10x", l: "10×" }].map((o) => (
              <button key={o.v} onClick={() => setMaxOdds(o.v)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: o.v === "345x" ? 13 : 15, fontWeight: 600, cursor: "pointer", background: maxOdds === o.v ? "rgba(76,175,80,.15)" : "rgba(255,255,255,.03)", color: maxOdds === o.v ? "#4caf50" : "#888", border: `1px solid ${maxOdds === o.v ? "rgba(76,175,80,.3)" : "rgba(255,255,255,.06)"}`, transition: "all .2s", minWidth: 0 }}>{o.l}</button>
            ))}
          </div>
          <button onClick={() => setShowSetup(false)} style={{ width: "100%", padding: "14px 0", borderRadius: 10, fontSize: 16, fontWeight: 700, background: "linear-gradient(135deg,#2e7d32,#4caf50)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(76,175,80,.3)" }}>Start Session →</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#555" }}>You shoot first. Seven-out passes dice clockwise.</div>
      </div>
    </div>
  );
}
