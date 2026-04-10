export default function GameRollButton({ onClick, disabled, isDesktop, isBotShooter, isBotActive, label }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: isDesktop ? "14px 40px" : "12px 32px", borderRadius: 10, fontSize: isDesktop ? 16 : 15, fontWeight: 700,
      background: disabled ? "#2a2a3a" : isBotShooter ? (isBotActive ? "linear-gradient(135deg,#7b1fa2,#9c27b0)" : "linear-gradient(135deg,#6a1b9a,#8e24aa)") : "linear-gradient(135deg,#2e7d32,#4caf50)",
      color: disabled ? "#555" : "#fff", border: "none",
      cursor: disabled ? "not-allowed" : "pointer", letterSpacing: ".05em",
      boxShadow: disabled ? "none" : isBotShooter ? "0 4px 20px rgba(156,39,176,.35)" : "0 4px 20px rgba(76,175,80,.3)",
      animation: !disabled && !isBotActive ? (isBotShooter ? "pulsePurple 2s infinite" : "pulseGreen 2s infinite") : "none",
      transition: "all .3s", whiteSpace: "nowrap",
    }}>{label}</button>
  );
}
