import { HOUSE_EDGES, ratingColor, getMaxOddsAmt } from "../lib/betLogic.js";
import Badge from "./Badge.jsx";

const BET_LABELS = { pass: "Pass Line", dontPass: "Don't Pass", passOdds: "Pass Odds", dontPassOdds: "DP Odds", come: "Come (pending)", dontCome: "DC (pending)", comeOdds: "Come Odds (pre)", dontComeOdds: "DC Odds (pre)", place4: "Place 4", place5: "Place 5", place6: "Place 6", place8: "Place 8", place9: "Place 9", place10: "Place 10", field: "Field", hardway4: "Hard 4", hardway6: "Hard 6", hardway8: "Hard 8", hardway10: "Hard 10", any7: "Any 7", anyCraps: "Any Craps", yo: "Yo", boxcars: "Boxcars", aces: "Aces", buy4: "Buy 4", buy10: "Buy 10", horn: "Horn", ce: "C&E" };

function SmallBtn({ onClick, disabled, color = "#4caf50", children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "2px 7px", fontSize: 10, borderRadius: 3, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? "#222" : `${color}18`, color: disabled ? "#444" : color,
      border: `1px solid ${disabled ? "#333" : `${color}44`}`, lineHeight: 1,
    }}>{children}</button>
  );
}

export default function ActiveBets({
  pnl_,
  mono,
  bets,
  comePoints,
  dontComePoints,
  totalBets,
  comeTotal,
  dcTotal,
  maxOdds,
  bankroll,
  betUnit,
  addComeOdds,
  removeComeOdds,
  addDcOdds,
  removeDcOdds,
}) {
  const allBetsAtRisk = Object.entries(bets).filter(([, v]) => v > 0);
  const hasAnything = allBetsAtRisk.length > 0 || comePoints.length > 0 || dontComePoints.length > 0;

  if (!hasAnything) {
    return (
      <div style={{ ...pnl_, padding: "14px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#444", fontStyle: "italic" }}>No bets on the table</div>
      </div>
    );
  }

  const lineKeys = ["pass", "passOdds", "dontPass", "dontPassOdds"];
  const placeKeys = ["place4", "place5", "place6", "place8", "place9", "place10"];
  const otherKeys = ["come", "comeOdds", "dontCome", "dontComeOdds", "field", "hardway4", "hardway6", "hardway8", "hardway10", "any7", "anyCraps", "yo", "boxcars", "aces"];
  const activeLine = lineKeys.filter((k) => bets[k] > 0);
  const activePlace = placeKeys.filter((k) => bets[k] > 0);
  const activeOther = otherKeys.filter((k) => bets[k] > 0);

  const BetRow = ({ label, amount, he, accent = "#888" }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", fontSize: 12 }}>
      <span style={{ color: "#aaa" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: mono, fontWeight: 600, color: accent }}>${amount}</span>
        {he !== undefined && <span style={{ fontSize: 9, color: ratingColor(he), fontFamily: mono }}>{he}%</span>}
      </div>
    </div>
  );

  const ComeRow = ({ type, cp, idx }) => {
    const isCome = type === "come";
    const color = isCome ? "#4caf50" : "#f44336";
    const addFn = isCome ? addComeOdds : addDcOdds;
    const rmFn = isCome ? removeComeOdds : removeDcOdds;
    const maxOddsAmt = getMaxOddsAmt(maxOdds, cp.amount, cp.number);
    const atMax = cp.odds >= maxOddsAmt;
    return (
      <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#ccc", fontWeight: 600 }}>{isCome ? "Come" : "DC"} on {cp.number}</span>
          </div>
          <span style={{ fontFamily: mono, fontWeight: 600, color, fontSize: 12 }}>${cp.amount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#888" }}>Odds:</span>
            <span style={{ fontFamily: mono, fontWeight: 600, color: cp.odds > 0 ? "#00e676" : "#555", fontSize: 12 }}>${cp.odds}</span>
            <span style={{ fontSize: 9, color: atMax ? "#00e676" : "#555", fontFamily: mono }}>/{maxOddsAmt}</span>
            <Badge he={0} />
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            <SmallBtn onClick={() => addFn(idx)} disabled={bankroll < betUnit || atMax} color="#4caf50">+</SmallBtn>
            <SmallBtn onClick={() => rmFn(idx)} disabled={cp.odds <= 0} color="#f44336">−</SmallBtn>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...pnl_, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#666" }}>ACTIVE BETS</span>
        <span style={{ fontSize: 11, fontFamily: mono, fontWeight: 700, color: "#ff9800" }}>${totalBets + comeTotal + dcTotal} at risk</span>
      </div>

      {activeLine.length > 0 && <>
        <div style={{ fontSize: 9, color: "#555", letterSpacing: ".1em", fontWeight: 600, marginTop: 4, marginBottom: 2 }}>LINE</div>
        {activeLine.map((k) => <BetRow key={k} label={BET_LABELS[k]} amount={bets[k]} he={HOUSE_EDGES[k.includes("Odds") ? "odds" : k]} accent={k.includes("Odds") ? "#00e676" : "#4caf50"} />)}
      </>}

      {comePoints.length > 0 && <>
        <div style={{ fontSize: 9, color: "#555", letterSpacing: ".1em", fontWeight: 600, marginTop: 8, marginBottom: 2 }}>COME POINTS</div>
        {comePoints.map((cp, i) => <ComeRow key={`c${i}`} type="come" cp={cp} idx={i} />)}
      </>}

      {dontComePoints.length > 0 && <>
        <div style={{ fontSize: 9, color: "#555", letterSpacing: ".1em", fontWeight: 600, marginTop: 8, marginBottom: 2 }}>DON&apos;T COME POINTS</div>
        {dontComePoints.map((dp, i) => <ComeRow key={`d${i}`} type="dc" cp={dp} idx={i} />)}
      </>}

      {activePlace.length > 0 && <>
        <div style={{ fontSize: 9, color: "#555", letterSpacing: ".1em", fontWeight: 600, marginTop: 8, marginBottom: 2 }}>PLACE</div>
        {activePlace.map((k) => <BetRow key={k} label={BET_LABELS[k]} amount={bets[k]} he={HOUSE_EDGES[k]} accent="#ffc107" />)}
      </>}

      {activeOther.length > 0 && <>
        <div style={{ fontSize: 9, color: "#555", letterSpacing: ".1em", fontWeight: 600, marginTop: 8, marginBottom: 2 }}>OTHER</div>
        {activeOther.map((k) => <BetRow key={k} label={BET_LABELS[k]} amount={bets[k]} he={HOUSE_EDGES[k]} accent="#888" />)}
      </>}
    </div>
  );
}
