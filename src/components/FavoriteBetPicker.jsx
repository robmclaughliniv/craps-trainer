import { BET_CATALOG, BET_LABELS, SHORT_LABELS } from "../lib/favoriteBets.js";

const tabs = [
  { id: "line", label: "Line" },
  { id: "place", label: "Place/Buy" },
  { id: "props", label: "Props" },
  { id: "bonus", label: "Bonus" },
];

export default function FavoriteBetPicker({
  tab,
  setTab,
  favoriteSlots,
  pickerSlotIndex,
  onSelect,
}) {
  const takenElsewhere = (key) => {
    const idx = favoriteSlots.indexOf(key);
    return idx >= 0 && idx !== pickerSlotIndex;
  };

  return (
    <div>
      {pickerSlotIndex !== null && (
        <div style={{ fontSize: 12, color: "#888", marginBottom: 10, textAlign: "center" }}>
          Choose a bet for slot {pickerSlotIndex + 1}
          {favoriteSlots[pickerSlotIndex] && (
            <span style={{ color: "#4caf50" }}> (currently {SHORT_LABELS[favoriteSlots[pickerSlotIndex]]})</span>
          )}
        </div>
      )}

      <div style={{ display: "flex", background: "#12121f", borderRadius: "8px 8px 0 0", border: "1px solid rgba(255,255,255,.06)", borderBottom: "none", overflow: "hidden" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "12px 0",
              fontSize: 12,
              fontWeight: 600,
              background: tab === t.id ? "rgba(76,175,80,.08)" : "transparent",
              color: tab === t.id ? "#4caf50" : "#666",
              border: "none",
              cursor: "pointer",
              borderBottom: tab === t.id ? "2px solid #4caf50" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{
        background: "#12121f",
        border: "1px solid rgba(255,255,255,.06)",
        borderTop: "none",
        borderRadius: "0 0 8px 8px",
        padding: 8,
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 6,
      }}>
        {(BET_CATALOG[tab] || []).map((key) => {
          const taken = takenElsewhere(key);
          const isCurrent = favoriteSlots[pickerSlotIndex] === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              disabled={pickerSlotIndex === null}
              style={{
                minHeight: 48,
                padding: "10px 8px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "left",
                background: isCurrent ? "rgba(76,175,80,.15)" : taken ? "rgba(255,255,255,.02)" : "rgba(255,255,255,.04)",
                color: isCurrent ? "#4caf50" : taken ? "#555" : "#ccc",
                border: `1px solid ${isCurrent ? "rgba(76,175,80,.35)" : "rgba(255,255,255,.06)"}`,
                cursor: pickerSlotIndex === null ? "not-allowed" : "pointer",
              }}
            >
              <div>{BET_LABELS[key] || key}</div>
              {taken && !isCurrent && (
                <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>In slot {favoriteSlots.indexOf(key) + 1} — tap to swap</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
