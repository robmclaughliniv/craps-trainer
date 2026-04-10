export default function ShooterTag({ compact, isBotShooter, currentShooter, nextShooter, mono }) {
  return (
    <span style={{
      fontSize: compact ? 10 : 11, padding: "3px 10px", borderRadius: 4,
      background: isBotShooter ? "rgba(156,39,176,.15)" : "rgba(76,175,80,.15)",
      color: isBotShooter ? "#ba68c8" : "#4caf50",
      fontWeight: 600, fontFamily: mono, whiteSpace: "nowrap",
    }}>
      🎲 {currentShooter.name}{!compact && isBotShooter && ` · next: ${nextShooter.name}`}
    </span>
  );
}
