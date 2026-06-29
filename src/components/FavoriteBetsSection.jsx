import ComePointActions from "./ComePointActions.jsx";
import FavoriteBetGrid from "./FavoriteBetGrid.jsx";
import FavoriteBetPicker from "./FavoriteBetPicker.jsx";

export default function FavoriteBetsSection({
  pnl_,
  favoriteSlots,
  bets,
  phase,
  point,
  maxOdds,
  bankroll,
  tableMin,
  allSmallBet,
  allTallBet,
  allNumbersBet,
  placeBet,
  removeBet,
  onBonusBet,
  onBonusRemove,
  comePoints,
  dontComePoints,
  addComeOdds,
  removeComeOdds,
  addDcOdds,
  removeDcOdds,
  editing,
  onToggleEdit,
  pickerSlotIndex,
  onSlotTap,
  pickerTab,
  setPickerTab,
  onFavoriteSelect,
  mono,
}) {
  return (
    <div style={{ ...pnl_, borderRadius: 8, flexShrink: 0 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", color: "#555" }}>
          FAVORITES
        </div>
        <button
          onClick={onToggleEdit}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 6,
            background: editing ? "rgba(76,175,80,.12)" : "rgba(255,255,255,.04)",
            color: editing ? "#4caf50" : "#888",
            border: `1px solid ${editing ? "rgba(76,175,80,.25)" : "rgba(255,255,255,.06)"}`,
            cursor: "pointer",
          }}
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {!editing && (
        <ComePointActions
          comePoints={comePoints}
          dontComePoints={dontComePoints}
          maxOdds={maxOdds}
          bankroll={bankroll}
          tableMin={tableMin}
          addComeOdds={addComeOdds}
          removeComeOdds={removeComeOdds}
          addDcOdds={addDcOdds}
          removeDcOdds={removeDcOdds}
          mono={mono}
        />
      )}

      <FavoriteBetGrid
        favoriteSlots={favoriteSlots}
        bets={bets}
        phase={phase}
        point={point}
        maxOdds={maxOdds}
        bankroll={bankroll}
        tableMin={tableMin}
        allSmallBet={allSmallBet}
        allTallBet={allTallBet}
        allNumbersBet={allNumbersBet}
        placeBet={placeBet}
        removeBet={removeBet}
        onBonusBet={onBonusBet}
        onBonusRemove={onBonusRemove}
        editing={editing}
        onSlotTap={onSlotTap}
        mono={mono}
        compact
      />

      {editing && (
        <div style={{ padding: "0 12px 12px" }}>
          <div style={{ fontSize: 12, color: "#888", textAlign: "center", marginBottom: 8 }}>
            Tap a slot above, then pick a bet from the catalog.
          </div>
          <FavoriteBetPicker
            tab={pickerTab}
            setTab={setPickerTab}
            favoriteSlots={favoriteSlots}
            pickerSlotIndex={pickerSlotIndex}
            onSelect={onFavoriteSelect}
          />
        </div>
      )}
    </div>
  );
}
