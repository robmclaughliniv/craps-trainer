const titles = {
  position: "Position",
  coach: "Coach",
  history: "History",
};

export default function MobileSheet({ sheet, onClose, children }) {
  if (!sheet) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
    }}>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,.55)",
          backdropFilter: "blur(2px)",
        }}
      />

      <div style={{
        position: "relative",
        maxHeight: "75dvh",
        background: "#0a0a14",
        borderRadius: "16px 16px 0 0",
        border: "1px solid rgba(255,255,255,.08)",
        borderBottom: "none",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn .25s ease-out",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px 8px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          flexShrink: 0,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.15)", position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: ".05em" }}>{titles[sheet] || sheet}</span>
          <button
            onClick={onClose}
            style={{
              fontSize: 20,
              background: "rgba(255,255,255,.06)",
              border: "none",
              borderRadius: 8,
              width: 36,
              height: 36,
              color: "#888",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
