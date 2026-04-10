export default function PhaseTag({ phase, point, mono }) {
  return (
    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, background: phase === "comeout" ? "rgba(33,150,243,.15)" : "rgba(255,152,0,.15)", color: phase === "comeout" ? "#2196f3" : "#ff9800", fontWeight: 600, fontFamily: mono }}>
      {phase === "comeout" ? "COME OUT" : `POINT: ${point}`}
    </span>
  );
}
