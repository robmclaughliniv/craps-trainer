import { useState, useEffect } from "react";

const DICE_DOTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

export default function Die({ value, rolling, delay = 0, color = "#fff", size = 72 }) {
  const dots = DICE_DOTS[value] || [];
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (rolling) { setShake(true); const t = setTimeout(() => setShake(false), 600 + delay * 1000); return () => clearTimeout(t); }
  }, [rolling, delay]);
  const dotSize = Math.round(size * 0.167);
  return (
    <div style={{
      width: size, height: size, background: color, borderRadius: Math.round(size * 0.167),
      display: "grid", placeItems: "center", position: "relative",
      boxShadow: shake
        ? "0 8px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)"
        : "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
      animation: shake ? `diceTumble 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) ${delay}s both` : "none",
      border: "1px solid rgba(255,255,255,0.15)",
      transition: "box-shadow 0.3s ease",
    }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute", width: dotSize, height: dotSize, borderRadius: "50%",
          background: "#1a1a2e", left: `${d[0]}%`, top: `${d[1]}%`,
          transform: "translate(-50%, -50%)",
          boxShadow: "inset 0 2px 3px rgba(0,0,0,0.3)",
        }} />
      ))}
    </div>
  );
}
