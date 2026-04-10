export default function TrainerStat({ label, value, color = "#fff", isDesktop, mono }) {
  return (
    <div style={{ textAlign: isDesktop ? "center" : "right" }}>
      <div style={{ fontSize: 10, color: "#666", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: isDesktop ? 18 : 16, fontWeight: 700, color, fontFamily: mono }}>{value}</div>
    </div>
  );
}
