import { ratingColor, ratingLabel } from "../lib/betLogic.js";

export default function Badge({ he }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
      background: ratingColor(he) + "22", color: ratingColor(he),
      letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace",
    }}>
      {ratingLabel(he)} {he}%
    </span>
  );
}
