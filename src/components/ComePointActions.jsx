import { getMaxOddsAmt, getBetAddAmount } from "../lib/betLogic.js";

function OddsBtn({ onClick, disabled, color, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 44,
        minHeight: 44,
        padding: "8px 12px",
        fontSize: 16,
        fontWeight: 700,
        borderRadius: 8,
        background: disabled ? "#222" : `${color}22`,
        color: disabled ? "#444" : color,
        border: `1px solid ${disabled ? "#333" : `${color}55`}`,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function PointRow({ type, cp, idx, maxOdds, bankroll, tableMin, addFn, removeFn, mono }) {
  const isCome = type === "come";
  const color = isCome ? "#4caf50" : "#f44336";
  const oddsKey = isCome ? "comeOdds" : "dontComeOdds";
  const maxOddsAmt = getMaxOddsAmt(maxOdds, cp.amount, cp.number);
  const atMax = cp.odds >= maxOddsAmt;
  const addAmt = getBetAddAmount(oddsKey, tableMin, cp.odds);

  return (
    <div style={{
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 10px",
      borderRadius: 10,
      background: "rgba(255,255,255,.04)",
      border: `1px solid ${color}33`,
      minWidth: 200,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>
          {isCome ? "Come" : "DC"} {cp.number}
        </div>
        <div style={{ fontSize: 10, fontFamily: mono, color: "#888", marginTop: 2 }}>
          ${cp.amount} · Odds ${cp.odds}/${maxOddsAmt}
        </div>
      </div>
      <OddsBtn onClick={() => addFn(idx)} disabled={bankroll < addAmt || atMax} color="#4caf50">+</OddsBtn>
      <OddsBtn onClick={() => removeFn(idx)} disabled={cp.odds <= 0} color="#f44336">−</OddsBtn>
    </div>
  );
}

export default function ComePointActions({
  comePoints,
  dontComePoints,
  maxOdds,
  bankroll,
  tableMin,
  addComeOdds,
  removeComeOdds,
  addDcOdds,
  removeDcOdds,
  mono,
}) {
  if (comePoints.length === 0 && dontComePoints.length === 0) return null;

  return (
    <div style={{ padding: "8px 12px 0" }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: "#555", marginBottom: 6 }}>
        COME / DC ODDS
      </div>
      <div style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 4,
        WebkitOverflowScrolling: "touch",
      }}>
        {comePoints.map((cp, i) => (
          <PointRow
            key={`c${i}`}
            type="come"
            cp={cp}
            idx={i}
            maxOdds={maxOdds}
            bankroll={bankroll}
            tableMin={tableMin}
            addFn={addComeOdds}
            removeFn={removeComeOdds}
            mono={mono}
          />
        ))}
        {dontComePoints.map((dp, i) => (
          <PointRow
            key={`d${i}`}
            type="dc"
            cp={dp}
            idx={i}
            maxOdds={maxOdds}
            bankroll={bankroll}
            tableMin={tableMin}
            addFn={addDcOdds}
            removeFn={removeDcOdds}
            mono={mono}
          />
        ))}
      </div>
    </div>
  );
}
