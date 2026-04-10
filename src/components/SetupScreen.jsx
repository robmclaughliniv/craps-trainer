export default function SetupScreen({
  CSS,
  pnl_,
  bankroll,
  setBankroll,
  startingBankroll,
  setStartingBankroll,
  betUnit,
  setBetUnit,
  tableMin,
  setTableMin,
  buyVigPolicy,
  setBuyVigPolicy,
  fieldPayOn12,
  setFieldPayOn12,
  maxOdds,
  setMaxOdds,
  setShowSetup,
}) {
  const setupUnits = tableMin > 0 ? Math.floor(startingBankroll / tableMin) : 0;
  const btnStyle = (selected) => ({
    flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer",
    background: selected ? "rgba(76,175,80,.15)" : "rgba(255,255,255,.03)",
    color: selected ? "#4caf50" : "#888",
    border: `1px solid ${selected ? "rgba(76,175,80,.3)" : "rgba(255,255,255,.06)"}`,
    transition: "all .2s",
  });

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
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            {[200, 500, 1000, 2000].map((v) => (
              <button key={v} onClick={() => { setBankroll(v); setStartingBankroll(v); }} style={btnStyle(startingBankroll === v)}>${v}</button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: setupUnits < 20 ? 4 : 24, textAlign: "center" }}>
            {setupUnits} units at ${tableMin} table
          </div>
          {setupUnits < 10 && (
            <div style={{ fontSize: 12, color: "#f44336", marginBottom: 8, lineHeight: 1.4, padding: "6px 10px", borderRadius: 6, background: "rgba(244,67,54,.08)", border: "1px solid rgba(244,67,54,.2)" }}>
              Critically undercapitalized — risk of ruin is severe.
            </div>
          )}
          {setupUnits >= 10 && setupUnits < 20 && (
            <div style={{ fontSize: 12, color: "#ffc107", marginBottom: 8, lineHeight: 1.4, padding: "6px 10px", borderRadius: 6, background: "rgba(255,193,7,.06)", border: "1px solid rgba(255,193,7,.15)" }}>
              Undercapitalized. ${startingBankroll} at a ${tableMin} table = {setupUnits} units. Recommended: 20+ units. Either find a lower-min table or buy in for ${tableMin * 20}.
            </div>
          )}
          {setupUnits < 20 && <div style={{ marginBottom: 16 }} />}

          <label style={{ fontSize: 12, color: "#888", fontWeight: 600, letterSpacing: ".1em", display: "block", marginBottom: 8 }}>TABLE MINIMUM</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[5, 10, 15, 25].map((v) => (
              <button key={v} onClick={() => setTableMin(v)} style={btnStyle(tableMin === v)}>${v}</button>
            ))}
          </div>
          <label style={{ fontSize: 12, color: "#888", fontWeight: 600, letterSpacing: ".1em", display: "block", marginBottom: 8 }}>TABLE RULES</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#666", marginBottom: 4, textAlign: "center" }}>Buy Vig</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setBuyVigPolicy("on-win")} style={{ ...btnStyle(buyVigPolicy === "on-win"), fontSize: 11, padding: "8px 0" }}>On win</button>
                <button onClick={() => setBuyVigPolicy("always")} style={{ ...btnStyle(buyVigPolicy === "always"), fontSize: 11, padding: "8px 0" }}>Always</button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#666", marginBottom: 4, textAlign: "center" }}>Field 12 pays</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setFieldPayOn12(3)} style={{ ...btnStyle(fieldPayOn12 === 3), fontSize: 11, padding: "8px 0" }}>3×</button>
                <button onClick={() => setFieldPayOn12(2)} style={{ ...btnStyle(fieldPayOn12 === 2), fontSize: 11, padding: "8px 0" }}>2×</button>
              </div>
            </div>
          </div>
          <label style={{ fontSize: 12, color: "#888", fontWeight: 600, letterSpacing: ".1em", display: "block", marginBottom: 8 }}>BET UNIT</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[5, 10, 15, 25].map((v) => (
              <button key={v} onClick={() => setBetUnit(v)} style={btnStyle(betUnit === v)}>${v}</button>
            ))}
          </div>
          <label style={{ fontSize: 12, color: "#888", fontWeight: 600, letterSpacing: ".1em", display: "block", marginBottom: 8 }}>MAX ODDS</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
            {[{ v: "1x", l: "1×" }, { v: "2x", l: "2×" }, { v: "345x", l: "3-4-5×" }, { v: "5x", l: "5×" }, { v: "10x", l: "10×" }].map((o) => (
              <button key={o.v} onClick={() => setMaxOdds(o.v)} style={{ ...btnStyle(maxOdds === o.v), fontSize: o.v === "345x" ? 13 : 15, minWidth: 0 }}>{o.l}</button>
            ))}
          </div>
          <button onClick={() => setShowSetup(false)} style={{ width: "100%", padding: "14px 0", borderRadius: 10, fontSize: 16, fontWeight: 700, background: "linear-gradient(135deg,#2e7d32,#4caf50)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(76,175,80,.3)" }}>Start Session →</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#555" }}>You shoot first. Seven-out passes dice clockwise.</div>
      </div>
    </div>
  );
}
