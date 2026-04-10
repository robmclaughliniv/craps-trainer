export default function BankrollZone({
  compact,
  pnl_,
  zoneInfo,
  bankrollPct,
  exposurePct,
  mono,
  bankroll = 0,
  currentTotalExposure = 0,
}) {
  if (compact) {
    const barPct = Math.min(bankrollPct, 150);
    const barColor = zoneInfo.zone === "STOP" ? "#f44336" : zoneInfo.zone === "DANGER" ? "#ff5722" : zoneInfo.zone === "HOT" ? "#ff9800" : zoneInfo.zone === "HOUSE $" ? "#00e676" : "#4caf50";
    return (
      <div style={{ padding: "0 12px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,.06)", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", left: "20%", top: 0, bottom: 0, width: 1, background: "rgba(244,67,54,.4)" }} />
            <div style={{ position: "absolute", left: "33%", top: 0, bottom: 0, width: 1, background: "rgba(255,152,0,.3)" }} />
            <div style={{ height: "100%", width: `${Math.min(barPct / 1.5, 100)}%`, borderRadius: 2, background: barColor, transition: "width .3s, background .3s" }} />
          </div>
          <span style={{ fontSize: 8, fontWeight: 700, color: zoneInfo.color, fontFamily: mono, letterSpacing: ".05em", whiteSpace: "nowrap" }}>{zoneInfo.zone}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...pnl_, padding: "10px 12px", border: `1px solid ${zoneInfo.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#666" }}>BANKROLL ZONE</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: zoneInfo.color, fontFamily: mono }}>{zoneInfo.zone}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,.06)", overflow: "hidden", position: "relative", marginBottom: 8 }}>
        <div style={{ position: "absolute", left: "20%", top: 0, bottom: 0, width: 1, background: "rgba(244,67,54,.5)" }} />
        <div style={{ position: "absolute", left: "33.3%", top: 0, bottom: 0, width: 1, background: "rgba(255,152,0,.4)" }} />
        <div style={{ position: "absolute", left: "66.6%", top: 0, bottom: 0, width: 1, background: "rgba(76,175,80,.3)" }} />
        <div style={{ height: "100%", width: `${Math.min(bankrollPct / 1.5, 100)}%`, borderRadius: 4, background: `linear-gradient(90deg, ${zoneInfo.color}cc, ${zoneInfo.color})`, transition: "width .3s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 6 }}>
        <span style={{ color: "#888" }}>Bankroll: <span style={{ color: zoneInfo.color, fontWeight: 600, fontFamily: mono }}>{bankrollPct}%</span> of buy-in</span>
        <span style={{ color: "#888" }}>Exposure: <span style={{ color: exposurePct > 20 ? "#ff9800" : "#888", fontWeight: 600, fontFamily: mono }}>{exposurePct}%</span></span>
      </div>
      {currentTotalExposure > 0 && (() => {
        const sso = Math.floor(bankroll / Math.max(currentTotalExposure, 1));
        const ssoColor = sso >= 4 ? "#4caf50" : sso >= 2 ? "#ffc107" : "#f44336";
        return (
          <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>
            Survivable seven-outs: <span style={{ color: ssoColor, fontWeight: 700, fontFamily: mono }}>{sso}</span>
          </div>
        );
      })()}
      <div style={{ fontSize: 11, color: zoneInfo.color, lineHeight: 1.3 }}>{zoneInfo.msg}</div>
    </div>
  );
}
