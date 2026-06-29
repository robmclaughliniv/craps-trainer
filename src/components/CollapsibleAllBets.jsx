export default function CollapsibleAllBets({ collapsed, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: collapsed ? 8 : "8px 8px 0 0",
          background: "#12121f",
          border: "1px solid rgba(255,255,255,.06)",
          borderBottom: collapsed ? "1px solid rgba(255,255,255,.06)" : "none",
          color: "#888",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>All Bets</span>
        <span style={{ fontSize: 10 }}>{collapsed ? "▼" : "▲"}</span>
      </button>
      {!collapsed && children}
    </div>
  );
}
