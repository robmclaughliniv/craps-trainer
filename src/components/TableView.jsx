export default function TableView({
  pnl_,
  mono,
  bets,
  point,
  phase,
  comePoints,
  dontComePoints,
  allSmallBet,
  allTallBet,
  allNumbersBet,
  allSmallHits,
  allTallHits,
  allNumbersHits,
}) {
  const Chip = ({ amount, color = "#4caf50", small }) => {
    if (!amount || amount <= 0) return null;
    const sz = small ? 20 : 24;
    return (
      <div style={{
        width: sz, height: sz, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: `radial-gradient(circle at 35% 35%, ${color}, ${color}aa)`,
        border: `2px solid ${color}dd`, boxShadow: "0 2px 6px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.3)",
        fontSize: small ? 7 : 8, fontWeight: 700, color: "#fff", fontFamily: mono, lineHeight: 1,
        position: "relative", zIndex: 2,
      }}>{amount}</div>
    );
  };

  const OddsChip = ({ amount }) => {
    if (!amount || amount <= 0) return null;
    return (
      <div style={{
        width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(circle at 35% 35%, #00e676, #00c853aa)",
        border: "2px solid #00e676bb", boxShadow: "0 1px 4px rgba(0,0,0,.4)",
        fontSize: 7, fontWeight: 700, color: "#fff", fontFamily: mono,
        position: "absolute", bottom: -6, right: -6, zIndex: 3,
      }}>{amount}</div>
    );
  };

  const Puck = ({ on }) => (
    <div style={{
      width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      background: on ? "#fff" : "#333", border: `2px solid ${on ? "#fff" : "#555"}`,
      fontSize: 7, fontWeight: 800, color: on ? "#000" : "#888", fontFamily: mono,
      boxShadow: on ? "0 0 8px rgba(255,255,255,.5)" : "none",
    }}>{on ? "ON" : "OFF"}</div>
  );

  const comeByNum = {};
  comePoints.forEach((cp) => { comeByNum[cp.number] = cp; });
  const dcByNum = {};
  dontComePoints.forEach((dp) => { dcByNum[dp.number] = dp; });

  const placeNums = [4, 5, 6, 8, 9, 10];
  const feltGreen = "#1a5c2a";
  const cellBorder = "1px solid #2d8a4688";

  return (
    <div style={{ ...pnl_, padding: 0, overflow: "hidden" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#666", padding: "8px 12px 4px" }}>TABLE VIEW</div>

      <div style={{ background: feltGreen, padding: 8, borderRadius: "0 0 8px 8px", position: "relative" }}>

        <div style={{ display: "flex", alignItems: "center", padding: "4px 6px", borderRadius: "6px 6px 0 0", border: cellBorder, borderBottom: "none", background: "rgba(0,0,0,.15)", marginBottom: 0 }}>
          <div style={{ flex: 1, fontSize: 9, fontWeight: 600, color: "#ccc", letterSpacing: ".05em" }}>DON&apos;T PASS BAR</div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <Chip amount={bets.dontPass} color="#f44336" small />
            {bets.dontPassOdds > 0 && <Chip amount={bets.dontPassOdds} color="#00e676" small />}
          </div>
        </div>

        <div style={{ display: "flex", border: cellBorder, borderBottom: "none" }}>
          {placeNums.map((num) => {
            const isPoint = point === num;
            const hasPlace = bets[`place${num}`] > 0;
            const hasCome = !!comeByNum[num];
            const hasDc = !!dcByNum[num];
            return (
              <div key={num} style={{
                flex: 1, padding: "6px 2px", textAlign: "center",
                borderRight: num !== 10 ? cellBorder : "none",
                background: isPoint ? "rgba(255,255,255,.08)" : "transparent",
                position: "relative", minHeight: 48,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: isPoint ? "#fff" : "#ffffffbb", fontFamily: mono }}>{num === 6 ? "SIX" : num === 8 ? "EIGHT" : num}</div>
                {isPoint && <div style={{ position: "absolute", top: 2, right: 2 }}><Puck on={true} /></div>}
                <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                  {hasPlace && <Chip amount={bets[`place${num}`]} color="#ffc107" small />}
                  {hasCome && (
                    <div style={{ position: "relative" }}>
                      <Chip amount={comeByNum[num].amount} color="#4caf50" small />
                      <OddsChip amount={comeByNum[num].odds} />
                    </div>
                  )}
                  {hasDc && (
                    <div style={{ position: "relative" }}>
                      <Chip amount={dcByNum[num].amount} color="#f44336" small />
                      <OddsChip amount={dcByNum[num].odds} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", border: cellBorder, borderBottom: "none" }}>
          <div style={{ flex: 2, padding: "5px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRight: cellBorder }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: "#ccc" }}>COME</span>
            <Chip amount={bets.come} color="#4caf50" small />
          </div>
          <div style={{ flex: 1, padding: "5px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: "#ccc" }}>DC</span>
            <Chip amount={bets.dontCome} color="#f44336" small />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 6px", border: cellBorder, borderBottom: "none", background: "rgba(0,0,0,.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#ccc" }}>FIELD</span>
            <span style={{ fontSize: 7, color: "#ffffff88" }}>2·3·4·9·10·11·12</span>
          </div>
          <Chip amount={bets.field} color="#8bc34a" small />
        </div>

        <div style={{ border: cellBorder, borderBottom: "none", padding: "4px 6px", background: "rgba(0,0,0,.2)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
            {[
              { label: "Hard 4", k: "hardway4" }, { label: "Hard 6", k: "hardway6" },
              { label: "Hard 8", k: "hardway8" }, { label: "Hard 10", k: "hardway10" },
              { label: "Any 7", k: "any7" }, { label: "Any Cr", k: "anyCraps" },
              { label: "Yo", k: "yo" }, { label: "12", k: "boxcars" }, { label: "2", k: "aces" }, { label: "Horn", k: "horn" }, { label: "C&E", k: "ce" }, { label: "Buy 4", k: "buy4" }, { label: "Buy 10", k: "buy10" },
            ].map((p) => {
              const amt = bets[p.k];
              if (!amt || amt <= 0) return null;
              return (
                <div key={p.k} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 5px", borderRadius: 4, background: "rgba(255,255,255,.06)" }}>
                  <span style={{ fontSize: 8, color: "#aaa" }}>{p.label}</span>
                  <Chip amount={amt} color={p.k.includes("hard") ? "#e040fb" : "#ff5722"} small />
                </div>
              );
            })}
            {!["hardway4", "hardway6", "hardway8", "hardway10", "any7", "anyCraps", "yo", "boxcars", "aces", "horn", "ce", "buy4", "buy10"].some((k) => bets[k] > 0) && (
              <span style={{ fontSize: 8, color: "#ffffff44", fontStyle: "italic" }}>center bets</span>
            )}
          </div>
        </div>

        {(allSmallBet > 0 || allTallBet > 0 || allNumbersBet > 0) && (
          <div style={{ border: cellBorder, borderBottom: "none", padding: "4px 6px", background: "rgba(0,0,0,.15)" }}>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
              {allSmallBet > 0 && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(255,152,0,.15)", color: "#ff9800", fontFamily: mono, fontWeight: 600 }}>SMALL ${allSmallBet} ({allSmallHits.length}/5)</span>}
              {allTallBet > 0 && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(255,152,0,.15)", color: "#ff9800", fontFamily: mono, fontWeight: 600 }}>TALL ${allTallBet} ({allTallHits.length}/5)</span>}
              {allNumbersBet > 0 && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(255,152,0,.15)", color: "#ff9800", fontFamily: mono, fontWeight: 600 }}>ALL ${allNumbersBet} ({allNumbersHits.length}/10)</span>}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", padding: "6px 6px", borderRadius: "0 0 4px 4px", border: cellBorder, background: "rgba(0,0,0,.1)" }}>
          <div style={{ flex: 1, fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: ".05em" }}>PASS LINE</div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {phase === "comeout" && !point && <Puck on={false} />}
            <div style={{ position: "relative" }}>
              <Chip amount={bets.pass} color="#4caf50" />
              {bets.passOdds > 0 && <OddsChip amount={bets.passOdds} />}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
