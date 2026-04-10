export default function ComePointPills({ comePoints, dontComePoints, mono }) {
  if (comePoints.length === 0 && dontComePoints.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 10 }}>
      {comePoints.map((cp, i) => (
        <span key={`c${i}`} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(76,175,80,.15)", color: "#4caf50", fontFamily: mono, fontWeight: 600 }}>
          COME {cp.number} ${cp.amount}{cp.odds > 0 ? ` +$${cp.odds}` : ""}
        </span>
      ))}
      {dontComePoints.map((dp, i) => (
        <span key={`d${i}`} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(244,67,54,.15)", color: "#f44336", fontFamily: mono, fontWeight: 600 }}>
          DC {dp.number} ${dp.amount}{dp.odds > 0 ? ` +$${dp.odds}` : ""}
        </span>
      ))}
    </div>
  );
}
