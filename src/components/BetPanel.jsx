import { HOUSE_EDGES, getMaxOddsAmt, getBuyHE, getFieldHE } from "../lib/betLogic.js";
import BetButton from "./BetButton.jsx";
import Badge from "./Badge.jsx";

const tabs = [{ id: "line", label: "Line" }, { id: "place", label: "Place/Buy" }, { id: "props", label: "Props" }, { id: "bonus", label: "Bonus" }];

export default function BetPanel({
  pnl_,
  tab,
  setTab,
  bets,
  placeBet,
  removeBet,
  phase,
  point,
  maxOdds,
  comePoints,
  dontComePoints,
  bankroll,
  setBankroll,
  allSmallBet,
  setAllSmallBet,
  allTallBet,
  setAllTallBet,
  allNumbersBet,
  setAllNumbersBet,
  allSmallHits,
  setAllSmallHits,
  allTallHits,
  setAllTallHits,
  allNumbersHits,
  setAllNumbersHits,
  buyVigPolicy,
  fieldPayOn12,
}) {
  return (
    <div>
      <div style={{ display: "flex", background: "#12121f", borderRadius: "8px 8px 0 0", border: "1px solid rgba(255,255,255,.06)", borderBottom: "none", overflow: "hidden" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0", fontSize: 11, fontWeight: 600, background: tab === t.id ? "rgba(76,175,80,.08)" : "transparent", color: tab === t.id ? "#4caf50" : "#666", border: "none", cursor: "pointer", borderBottom: tab === t.id ? "2px solid #4caf50" : "2px solid transparent", letterSpacing: ".05em", transition: "all .2s" }}>{t.label}</button>
        ))}
      </div>
      <div style={{ ...pnl_, borderRadius: "0 0 8px 8px", borderTop: "none", padding: "8px 12px", minHeight: 120 }}>
        {tab === "line" && <>
          <BetButton label="Pass Line" he={HOUSE_EDGES.pass} amount={bets.pass} onBet={() => placeBet("pass")} onRemove={() => removeBet("pass")} disabled={phase === "point" && bets.pass === 0} />
          <BetButton label={`Pass Odds${point ? ` (${bets.passOdds}/${getMaxOddsAmt(maxOdds, bets.pass, point)})` : ""}`} he={HOUSE_EDGES.odds} amount={bets.passOdds} onBet={() => placeBet("passOdds")} onRemove={() => removeBet("passOdds")} disabled={bets.pass === 0 || phase === "comeout" || (point && bets.passOdds >= getMaxOddsAmt(maxOdds, bets.pass, point))} />
          <BetButton label="Don't Pass" he={HOUSE_EDGES.dontPass} amount={bets.dontPass} onBet={() => placeBet("dontPass")} onRemove={() => removeBet("dontPass")} disabled={phase === "point" && bets.dontPass === 0} />
          <BetButton label={`DP Odds${point ? ` (${bets.dontPassOdds}/${getMaxOddsAmt(maxOdds, bets.dontPass, point)})` : ""}`} he={HOUSE_EDGES.odds} amount={bets.dontPassOdds} onBet={() => placeBet("dontPassOdds")} onRemove={() => removeBet("dontPassOdds")} disabled={bets.dontPass === 0 || phase === "comeout" || (point && bets.dontPassOdds >= getMaxOddsAmt(maxOdds, bets.dontPass, point))} />
          <div style={{ height: 8 }} />
          <BetButton label="Come" he={HOUSE_EDGES.come} amount={bets.come} onBet={() => placeBet("come")} onRemove={() => removeBet("come")} disabled={phase === "comeout"} />
          <BetButton label="Don't Come" he={HOUSE_EDGES.dontCome} amount={bets.dontCome} onBet={() => placeBet("dontCome")} onRemove={() => removeBet("dontCome")} disabled={phase === "comeout"} />
          {(comePoints.length > 0 || dontComePoints.length > 0) && <div style={{ fontSize: 10, color: "#555", marginTop: 4, fontStyle: "italic" }}>Manage come/DC odds in Active Bets below ↓</div>}
        </>}
        {tab === "place" && <>
          <BetButton label="Place 6" he={HOUSE_EDGES.place6} amount={bets.place6} onBet={() => placeBet("place6")} onRemove={() => removeBet("place6")} disabled={phase === "comeout"} />
          <BetButton label="Place 8" he={HOUSE_EDGES.place8} amount={bets.place8} onBet={() => placeBet("place8")} onRemove={() => removeBet("place8")} disabled={phase === "comeout"} />
          <BetButton label="Place 5" he={HOUSE_EDGES.place5} amount={bets.place5} onBet={() => placeBet("place5")} onRemove={() => removeBet("place5")} disabled={phase === "comeout"} />
          <BetButton label="Place 9" he={HOUSE_EDGES.place9} amount={bets.place9} onBet={() => placeBet("place9")} onRemove={() => removeBet("place9")} disabled={phase === "comeout"} />
          <BetButton label="Place 4" he={HOUSE_EDGES.place4} amount={bets.place4} onBet={() => placeBet("place4")} onRemove={() => removeBet("place4")} disabled={phase === "comeout"} />
          <BetButton label="Place 10" he={HOUSE_EDGES.place10} amount={bets.place10} onBet={() => placeBet("place10")} onRemove={() => removeBet("place10")} disabled={phase === "comeout"} />
          <div style={{ height: 8 }} />
          <div style={{ fontSize: 10, color: "#555", letterSpacing: ".1em", fontWeight: 600, marginBottom: 4 }}>BUY BETS (true odds - 5% vig)</div>
          <BetButton label="Buy 4" he={getBuyHE(4, buyVigPolicy)} amount={bets.buy4} onBet={() => placeBet("buy4")} onRemove={() => removeBet("buy4")} disabled={phase === "comeout"} />
          <BetButton label="Buy 10" he={getBuyHE(10, buyVigPolicy)} amount={bets.buy10} onBet={() => placeBet("buy10")} onRemove={() => removeBet("buy10")} disabled={phase === "comeout"} />
          <div style={{ fontSize: 11, color: "#555", marginTop: 8, fontStyle: "italic" }}>Place 6/8 use $6 increments. Buy 4/10 beats Place 4/10 (4.76% vs 6.67%).</div>
        </>}
        {tab === "props" && <>
          <BetButton label="Field" he={getFieldHE(fieldPayOn12)} amount={bets.field} onBet={() => placeBet("field")} onRemove={() => removeBet("field")} />
          <div style={{ height: 4 }} />
          <div style={{ fontSize: 10, color: "#555", letterSpacing: ".1em", fontWeight: 600, marginBottom: 4 }}>ONE-ROLL PROPS</div>
          <BetButton label="Any 7" he={HOUSE_EDGES.any7} amount={bets.any7} onBet={() => placeBet("any7")} onRemove={() => removeBet("any7")} mini />
          <BetButton label="Any Craps" he={HOUSE_EDGES.anyCraps} amount={bets.anyCraps} onBet={() => placeBet("anyCraps")} onRemove={() => removeBet("anyCraps")} mini />
          <BetButton label="Yo (11)" he={HOUSE_EDGES.yo} amount={bets.yo} onBet={() => placeBet("yo")} onRemove={() => removeBet("yo")} mini />
          <BetButton label="Boxcars (12)" he={HOUSE_EDGES.boxcars} amount={bets.boxcars} onBet={() => placeBet("boxcars")} onRemove={() => removeBet("boxcars")} mini />
          <BetButton label="Horn ($4)" he={HOUSE_EDGES.horn} amount={bets.horn} onBet={() => placeBet("horn")} onRemove={() => removeBet("horn")} mini />
          <BetButton label="C&E" he={HOUSE_EDGES.ce} amount={bets.ce} onBet={() => placeBet("ce")} onRemove={() => removeBet("ce")} mini />
          <BetButton label="Aces (2)" he={HOUSE_EDGES.aces} amount={bets.aces} onBet={() => placeBet("aces")} onRemove={() => removeBet("aces")} mini />
        </>}
        {tab === "bonus" && <>
          <BetButton label="Hard 6" he={HOUSE_EDGES.hardway6} amount={bets.hardway6} onBet={() => placeBet("hardway6")} onRemove={() => removeBet("hardway6")} />
          <BetButton label="Hard 8" he={HOUSE_EDGES.hardway8} amount={bets.hardway8} onBet={() => placeBet("hardway8")} onRemove={() => removeBet("hardway8")} />
          <BetButton label="Hard 4" he={HOUSE_EDGES.hardway4} amount={bets.hardway4} onBet={() => placeBet("hardway4")} onRemove={() => removeBet("hardway4")} />
          <BetButton label="Hard 10" he={HOUSE_EDGES.hardway10} amount={bets.hardway10} onBet={() => placeBet("hardway10")} onRemove={() => removeBet("hardway10")} />
          <div style={{ height: 8 }} />
          <div style={{ fontSize: 10, color: "#555", letterSpacing: ".1em", fontWeight: 600, marginBottom: 4 }}>ALL BETS (multi-roll, lose on 7)</div>
          {[
            { label: "All Small", bet: allSmallBet, setBet: setAllSmallBet, hits: allSmallHits, setHits: setAllSmallHits, need: "2,3,4,5,6", max: 5, pay: "34:1", he: HOUSE_EDGES.allSmall },
            { label: "All Tall", bet: allTallBet, setBet: setAllTallBet, hits: allTallHits, setHits: setAllTallHits, need: "8,9,10,11,12", max: 5, pay: "34:1", he: HOUSE_EDGES.allTall },
            { label: "All Numbers", bet: allNumbersBet, setBet: setAllNumbersBet, hits: allNumbersHits, setHits: setAllNumbersHits, need: "2-6,8-12", max: 10, pay: "175:1", he: HOUSE_EDGES.allNumbers },
          ].map((ab) => (
            <div key={ab.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: ab.bet > 0 ? "#e0e0e0" : "#888" }}>{ab.label} {ab.bet > 0 && <span style={{ color: "#ff9800", fontWeight: 600 }}>${ab.bet}</span>} <Badge he={ab.he} /></div>
                <div style={{ fontSize: 9, color: "#555" }}>{ab.hits.length > 0 ? (`Hit: ${ab.hits.slice().sort((a, b) => a - b).join(",")} (${ab.hits.length}/${ab.max})`) : `Need: ${ab.need} | Pays ${ab.pay}`}</div>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                <button onClick={() => { if (bankroll >= 5) { ab.setBet(ab.bet + 5); setBankroll((b) => b - 5); } }} disabled={bankroll < 5} style={{ padding: "3px 8px", fontSize: 10, borderRadius: 4, background: bankroll < 5 ? "#333" : "rgba(76,175,80,0.2)", color: bankroll < 5 ? "#555" : "#4caf50", border: `1px solid ${bankroll < 5 ? "#444" : "rgba(76,175,80,0.3)"}`, cursor: bankroll < 5 ? "not-allowed" : "pointer", fontWeight: 600 }}>+$5</button>
                {ab.bet > 0 && <button onClick={() => { setBankroll((b) => b + ab.bet); ab.setBet(0); ab.setHits([]); }} style={{ padding: "3px 8px", fontSize: 10, borderRadius: 4, background: "rgba(244,67,54,0.15)", color: "#f44336", border: "1px solid rgba(244,67,54,0.3)", cursor: "pointer", fontWeight: 600 }}>X</button>}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: "#555", marginTop: 8, fontStyle: "italic" }}>Hardways 9-11% edge. All bets lose on any 7.</div>
        </>}
      </div>
    </div>
  );
}
