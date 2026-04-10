# Craps Trainer v3 — Feature Spec (parallel-agent edition)

This spec is structured for **Cursor plan mode with Claude Opus 4.6**, with up to **3 agents working in parallel**. Sequential pre-work first, then 3 parallel epics with disjoint file ownership to minimize merge conflicts.

---

## How to use this doc

### Workflow

1. **Wave 0 must complete before Wave 1.** It is a refactor, not a feature, and the parallel epics depend on the resulting file structure. Do not parallelize Wave 0.
2. **Wave 1 runs 3 epics in parallel.** Each epic owns a defined set of files. Plan-mode review is the conflict gate — if two plans claim overlapping lines, serialize them.
3. **Each task is one plan-mode prompt.** Drop the task block into Cursor plan mode, review the plan, approve, execute.
4. **Tasks within an epic are sequential** (one agent working through their list). Tasks marked ⚡ are small enough to peel off to a 4th agent if you want.

### Task block conventions

Every task has:

- **Goal** — one sentence
- **Files** — exactly which files the task edits or creates
- **Spec** — what to build
- **Acceptance** — how to know it's done
- **Constraints** — what NOT to touch (critical in plan mode)

### Locked decisions (do not relitigate)

- 20× table minimum buy-in rule replaces any fixed dollar exposure ceiling
- "Smart Fun" is added as a 4th strategy (Pass + max odds + opportunistic 6/8 + one Come bet)
- Always max odds — the "skip odds" path is removed from the personal strategy mental model and from any in-app messaging
- Coverage tax must be surfaced honestly on the Veteran strategy card
- The instinct coach is rules-only. No external API calls.

---

## Wave 0 — Code split (sequential, one agent)

Goal: turn the ~1850-line `CrapsTrainer.jsx` into a coordinator that composes small modules. After this wave the codebase is ready for parallel feature work.

### Task 0.1 — Extract pure logic to `src/lib/`

**Goal:** move all non-React logic into pure modules.

**Files (create):**

- `src/lib/betLogic.js` — exports: `HOUSE_EDGES`, `ODDS_PAY`, `PLACE_PAY`, `BUY_PAY`, `ROLL_PROB`, `ratingColor`, `ratingLabel`, `classifyBet`, `getBetIncrement`, `getMaxOddsAmt`, `initialBets`, `SMART_BETS`, `OK_BETS`
- `src/lib/strategies.js` — exports: `STRATS`, `isOnStrategy(strategyId, betKey)`, `getStrategySteps(strategyId, gameState)` (extracted from `getSteps` inside `StrategyGuide`)
- `src/lib/coachEngine.js` — exports: `getLocalInstinct(snap)`, plus the `STICKMAN_*` constants
- `src/lib/sounds.js` — exports: `getAudioCtx`, `playTone`, `playDiceRoll`, `playWinSound`, `playLoseSound`, `playPointSetSound`, `playBigWinSound`, `speakCall`
- `src/lib/shooters.js` — exports: `SHOOTERS`

**Files (edit):** `src/CrapsTrainer.jsx` — replace inline definitions with imports.

**Acceptance:**

- `npm run build` passes
- `npm run dev` shows the trainer functioning identically
- No behavior changes anywhere

**Constraints:**

- Do not change function signatures unless extraction requires it
- Do not refactor logic inside the extracted functions
- Do not introduce new dependencies

---

### Task 0.2 — Extract components to `src/components/`

**Goal:** one file per component.

**Files (create):**

- `src/components/Die.jsx`
- `src/components/Badge.jsx`
- `src/components/BetButton.jsx`
- `src/components/SetupScreen.jsx` — extracted from the `if (showSetup)` block
- `src/components/BetPanel.jsx`
- `src/components/ActiveBets.jsx`
- `src/components/TableView.jsx`
- `src/components/CoachPanel.jsx`
- `src/components/ExposureMap.jsx`
- `src/components/StrategyGuide.jsx`
- `src/components/BankrollZone.jsx`
- `src/components/BetEfficiency.jsx`
- `src/components/SessionScorecard.jsx`
- `src/components/RollLog.jsx`
- `src/components/Footer.jsx`
- `src/components/DiceArea.jsx`

**Files (edit):** `src/CrapsTrainer.jsx` — replace inline component definitions with imports. Pass props explicitly.

**Acceptance:**

- All components render identically to current behavior
- Props are explicit — no implicit closure access to parent state
- `CrapsTrainer.jsx` no longer defines any of these components

**Constraints:**

- Do not introduce a state management library (Redux, Zustand, Context)
- Do not refactor styling — keep inline styles as-is
- Do not change visual output

---

### Task 0.3 — Slim `CrapsTrainer.jsx` to a coordinator

**Goal:** the main file should only coordinate state and compose the layout.

**Files (edit):** `src/CrapsTrainer.jsx`

**Spec:** after this task, `CrapsTrainer.jsx` contains only:

- State declarations (`useState`, `useRef`)
- Effects (`useEffect`)
- Event handlers: `placeBet`, `removeBet`, `addComeOdds`, `removeComeOdds`, `addDcOdds`, `removeDcOdds`, `rollDice`, `handleRollButton`, `resetSession`, `win`, `lose`, `push`, `trackBet`
- The `useWindowWidth` hook (or move to `src/hooks/useWindowWidth.js`)
- The desktop and mobile layout JSX
- The `<style>{CSS}</style>` block

**Acceptance:**

- `CrapsTrainer.jsx` is under 700 lines
- Build passes, behavior unchanged
- Shooter rotation, sound toggle, mobile/desktop layouts all still work

**Constraints:**

- No behavior changes
- No new features
- Do not move state into child components — state stays here, components receive props

---

## Wave 1 — Parallel feature epics

Three epics. Three agents. Disjoint file ownership.

### File ownership matrix

| File | Epic A | Epic B | Epic C |
|---|---|---|---|
| `src/components/SetupScreen.jsx` | ✅ | | |
| `src/components/BankrollZone.jsx` | ✅ | | |
| `src/components/Badge.jsx` | | | ✅ |
| `src/components/BetButton.jsx` | | | ✅ |
| `src/components/StrategyGuide.jsx` | | ✅ | |
| `src/components/CoachPanel.jsx` | | | ✅ |
| `src/lib/betLogic.js` | ✅ | | |
| `src/lib/strategies.js` | | ✅ | |
| `src/lib/coachEngine.js` | | | ✅ |
| `src/CrapsTrainer.jsx` | ⚠️ stats area, setup state, payout handlers | ⚠️ strategy state | ⚠️ PSO counter state |

⚠️ = partial edit. The three epics each touch `CrapsTrainer.jsx` in different concerns. The user (or merge gate) coordinates these. Agents are instructed to keep their edits minimal and clearly bracketed.

**Read-only for everyone:** the strategy reference doc, this spec.

---

## Epic A — Setup & Bankroll Awareness

**Goal:** make the setup screen aware of table rules, surface capitalization risk honestly, and update bet math for variable casino vig and field rules.

**Owned files:**

- `src/components/SetupScreen.jsx`
- `src/components/BankrollZone.jsx`
- `src/lib/betLogic.js`
- `src/CrapsTrainer.jsx` (header stats area + setup state declarations + payout handlers in `rollDice`)

### Task A.1 — Table minimum + 20× rule warning

**Goal:** add table minimum to setup, warn on undercapitalization, show units in the header.

**Files:**

- `src/components/SetupScreen.jsx`
- `src/CrapsTrainer.jsx`

**Spec:**

- Add `tableMin` state to `CrapsTrainer.jsx` (default `10`)
- In `SetupScreen.jsx`, add a "Table Minimum" selector with options: `5`, `10`, `15`, `25` (matches the bet unit selector style)
- Compute `units = Math.floor(bankroll / tableMin)` and display under the bankroll selector
- If `units < 20`: show yellow warning text *"Undercapitalized. {bankroll} at a {tableMin} table = {units} units. Recommended: 20+ units. Either find a lower-min table or buy in for ${tableMin * 20}."*
- If `units < 10`: red warning *"Critically undercapitalized — risk of ruin is severe."*
- Allow override; do not block "Start Session"
- In the main UI header (both desktop and mobile), add a "Units" stat next to "Bankroll" with color: green ≥20, yellow 10-19, red <10. Recompute on every roll.

**Acceptance:**

- Setting bankroll $100, tableMin $10 → shows yellow warning and 10 units
- Setting bankroll $200, tableMin $10 → no warning, 20 units green
- Setting bankroll $100, tableMin $25 → red warning, 4 units red
- Header units stat updates after every win/loss

**Constraints:**

- Do not change `betUnit` semantics — `tableMin` and `betUnit` are separate concepts
- Do not modify `BankrollZone.jsx` in this task (Task A.4 handles that)

---

### Task A.2 — Buy bet vig policy toggle

**Goal:** model the "vig charged on win only" rule that drops Buy 4/10 from 4.76% HE to 1.67%.

**Files:**

- `src/components/SetupScreen.jsx`
- `src/lib/betLogic.js`
- `src/CrapsTrainer.jsx` (only the buy-bet payout block in `rollDice`)

**Spec:**

- Add `buyVigPolicy` state to `CrapsTrainer.jsx`. Values: `"on-win"` or `"always"`. Default `"always"`.
- In `SetupScreen.jsx`, add a "Buy Vig" toggle: "Charged on win / Charged always"
- In `betLogic.js`, change `HOUSE_EDGES.buy4` and `HOUSE_EDGES.buy10` from constants to a function: `getBuyHE(num, vigPolicy)` returning `1.67` for vig-on-win on 4/10, `4.76` for vig-always
- Update `classifyBet`: when `vigPolicy === "on-win"`, Buy 4/10 returns `"smart"` instead of `"ok"`
- In `CrapsTrainer.jsx` `rollDice`: in the buy bet payout block, conditionally apply the 5% vig only on the wins when policy is `"on-win"`. Current code applies it always: `Math.floor(bets[key] * 2 * 0.95)`. New code: if vig-on-win, subtract 5% only at win time (already happening — the difference is that the vig is NOT collected up front when the bet is placed). Verify: current code does not collect vig at placement, so the only change is whether the bet classification reflects the better edge
- Pass `buyVigPolicy` from `CrapsTrainer.jsx` down to `BetButton.jsx` via the `BetPanel` for badge display

**Acceptance:**

- With vig-on-win set, Buy 4 and Buy 10 show SMART tier badges with 1.67% HE
- With vig-always set, Buy 4 and Buy 10 show OK tier badges with 4.76% HE
- Payout math is correct under both policies
- Bet efficiency grader counts vig-on-win Buy 4/10 as a smart bet

**Constraints:**

- Do not change Buy 5/9/6/8 — those aren't in the trainer right now and this task doesn't add them
- Do not modify `BetButton.jsx` beyond accepting the new HE value
- The signature change in `betLogic.js` is intentional — propagate it everywhere `HOUSE_EDGES.buy4` is referenced

---

### Task A.3 — Field 2× / 3× on 12 toggle ⚡

**Goal:** model cruise-ship-style Field bets that pay only 2× on 12.

**Files:**

- `src/components/SetupScreen.jsx`
- `src/lib/betLogic.js`
- `src/CrapsTrainer.jsx` (only the field payout block in `rollDice`)

**Spec:**

- Add `fieldPayOn12` state to `CrapsTrainer.jsx`. Values: `2` or `3`. Default `3`.
- In `SetupScreen.jsx`, add a "Field 12 pays" toggle: "2× / 3×"
- In `betLogic.js`, similar pattern to Task A.2: convert `HOUSE_EDGES.field` to a function `getFieldHE(payOn12)` returning `5.56` for 2× and `2.78` for 3×
- Update `classifyBet`: when `payOn12 === 2`, Field returns `"trash"` instead of `"ok"`
- In `CrapsTrainer.jsx` `rollDice`: the field payout for total === 12 currently uses `bets.field * 3`. Make it `bets.field * fieldPayOn12`

**Acceptance:**

- 3× setting: Field shows OK tier (2.78% HE), pays 3× on 12
- 2× setting: Field shows TRASH tier (5.56% HE), pays 2× on 12
- Other field outcomes unchanged

**Constraints:**

- Do not change the Field bet's other payouts (2 still pays 2×, 3/4/9/10/11 still pay 1×)

---

### Task A.4 — Bankroll Zone surfaces survivable seven-outs

**Goal:** replace the abstract exposure % with a concrete "you can survive N more seven-outs" stat.

**Files:**

- `src/components/BankrollZone.jsx`

**Spec:**

- Compute `survivableSevenOuts = Math.floor(bankroll / Math.max(currentTotalExposure, 1))`
- In the full (non-compact) version, add a line near the existing exposure display: *"Survivable seven-outs: {N}"*
- Color: green if ≥4, yellow if 2-3, red if ≤1
- Keep the existing exposure % alongside it for now — this is additive, not a replacement
- Recalibrate `getZone()` to use `units` (passed in as a prop from `CrapsTrainer.jsx`) instead of raw bankroll percentage where it makes sense — specifically, the STOP/DANGER thresholds should consider units, not just `bankrollPct`

**Acceptance:**

- With $200 bankroll, $50 in bets: shows "Survivable seven-outs: 4"
- With $50 bankroll, $40 in bets: shows "Survivable seven-outs: 1" (red)
- Compact bar version unchanged

**Constraints:**

- Do not redesign the Bankroll Zone visually
- Keep backward compatibility with existing color zones

---

### Epic A acceptance summary

After Tasks A.1–A.4:

- Setup screen has table minimum, buy vig, and field 12 toggles
- Header shows units and warns on undercapitalization
- Buy 4/10 with vig-on-win is correctly tiered and paid
- Field 2× cruise rule is correctly modeled
- Bankroll Zone shows survivable seven-outs
- All existing behavior preserved

---

## Epic B — Strategy System

**Goal:** add the Smart Fun strategy, surface the coverage tax on Veteran, and warn when a chosen strategy outpaces the buy-in.

**Owned files:**

- `src/lib/strategies.js`
- `src/components/StrategyGuide.jsx`
- `src/CrapsTrainer.jsx` (only strategy-related state — should be minimal)

### Task B.1 — Add Smart Fun strategy

**Goal:** define the new strategy and its step engine.

**Files:**

- `src/lib/strategies.js`

**Spec:**

- Add new entry to `STRATS`:

```js
{ id: "smartfun", label: "Smart Fun", short: "Pass + Smart Coverage", color: "#00bcd4" }
```

- Update `isOnStrategy("smartfun", betKey)` to return true for: `pass`, `passOdds`, `place6`, `place8`, `come`, `comeOdds`. False for everything else.
- Add the step engine inside `getStrategySteps`. Steps:

**Come-out phase:**
1. Place Pass Line (`$${betUnit}`)
2. Wait for point to be set

**Point phase, point IS 6:**
1. Pass Line on 6 ✓
2. Max odds on Pass (show progress: `{passOdds}/{passOddsMax}`)
3. Place 8 (skip Place 6 — it's the point)
4. Hold

**Point phase, point IS 8:**
1. Pass Line on 8 ✓
2. Max odds on Pass
3. Place 6 (skip Place 8 — it's the point)
4. Hold

**Point phase, point IS 4/5/9/10:**
1. Pass Line on {point} ✓
2. Max odds on Pass
3. Place 6
4. Place 8
5. Optional: One Come bet (only if no Come point already established)
6. Max odds on Come point when it travels
7. Hold

**Acceptance:**

- Selecting Smart Fun on a $10 unit, point 6: checklist shows Pass on 6, max odds, Place 8, hold
- Selecting Smart Fun, point 4: checklist shows Pass on 4, max odds, Place 6, Place 8, optional Come, hold
- `isOnStrategy` correctly tags Place 4/5/9/10 as off-strategy
- Bet Efficiency grader penalizes off-strategy bets

**Constraints:**

- Do not modify Conservative, Veteran, or Molly strategies
- Do not add a press rule to the step engine (the strategy spec mentions it as optional but it does not affect compliance)
- Maximum one Come bet at a time — do not implement Molly-style stacking

---

### Task B.2 — Coverage cost line on Veteran card ⚡

**Goal:** make the EV cost of the Veteran strategy visible on its card.

**Files:**

- `src/components/StrategyGuide.jsx`

**Spec:**

- When the active strategy is Veteran, render a small amber text line under the steps:

> *"Coverage tax: roughly $1.20 per decision more than Pass+Odds. You're trading EV for entertainment density. Smart Fun is the lower-cost alternative."*

- Color: amber (`#ff9800`), small font (size 11), italic
- Only show when Veteran is the selected strategy

**Acceptance:**

- Veteran selected → amber cost line visible
- Conservative/Smart Fun/Molly selected → no cost line
- Visual styling matches the existing strategy guide aesthetic

**Constraints:**

- Do not add cost lines to other strategies in this task (Smart Fun gets its own messaging in Task B.1's strategy card text)
- Do not change Veteran's step engine

---

### Task B.3 — Strategy + buy-in compatibility check

**Goal:** warn when a strategy needs more bankroll than the user has.

**Files:**

- `src/lib/strategies.js`
- `src/components/StrategyGuide.jsx`

**Spec:**

- Add a `minUnits` field to each `STRATS` entry:
  - Conservative: 20
  - Smart Fun: 25
  - Veteran: 30
  - 3-Pt Molly: 40
- In `StrategyGuide.jsx`, compute `units = Math.floor(bankroll / tableMin)` (received as props)
- If `units < strategy.minUnits` for the selected strategy, render a yellow warning under the strategy buttons:

> *"{label} typically needs {minUnits}× table min ({tableMin * minUnits} at {tableMin} tables). You have {units} units. Consider Conservative or Smart Fun instead."*

- Do not block selection — informational only

**Acceptance:**

- $100 bankroll, $10 table, selecting Molly → yellow warning showing 10 units vs 40 needed
- $400 bankroll, $10 table, selecting Molly → no warning
- $250 bankroll, $10 table, selecting Smart Fun → no warning (25 units = exactly the floor)

**Constraints:**

- Warning is informational; do not disable the strategy button
- Do not change the strategy step engine

---

### Epic B acceptance summary

After Tasks B.1–B.3:

- Smart Fun is a fully functional 4th strategy with correct compliance tracking
- Veteran strategy honestly displays its coverage tax
- Strategy selection warns when undercapitalized
- All four strategies coexist without breaking existing behavior

---

## Epic C — Coach Intelligence & Bet Display

**Goal:** sharpen the per-bet display, the instinct coach, and add the PSO tilt-prevention warning.

**Owned files:**

- `src/components/Badge.jsx`
- `src/components/BetButton.jsx`
- `src/components/CoachPanel.jsx`
- `src/lib/coachEngine.js`
- `src/CrapsTrainer.jsx` (PSO counter state only)

### Task C.1 — Per-roll edge alongside per-resolution on bet badges

**Goal:** stop conflating per-roll and per-resolution edge for multi-roll bets.

**Files:**

- `src/components/Badge.jsx`
- `src/components/BetButton.jsx`
- `src/lib/betLogic.js` (add a per-roll table — pure addition, no edits to existing exports)

**Spec:**

- Add `HOUSE_EDGES_PER_ROLL` to `betLogic.js` with the same keys as `HOUSE_EDGES`. Values from the strategy reference doc:
  - `pass: 0.42, dontPass: 0.40, come: 0.42, dontCome: 0.40, odds: 0`
  - `place6: 0.46, place8: 0.46, place5: 1.11, place9: 1.11, place4: 1.67, place10: 1.67`
  - `field: 5.56` (one-roll, same as resolution) `(2x: 5.56, but Field 3x: 2.78)` — Field is one-roll so per-roll = per-resolution
  - `hardway6: 2.78, hardway8: 2.78, hardway4: 2.78, hardway10: 2.78`
  - `any7: 16.67, anyCraps: 11.11, yo: 11.11, boxcars: 13.89, aces: 13.89, horn: 12.5, ce: 11.11`
  - `buy4: 0.42, buy10: 0.42` (with vig-on-win)
- In `Badge.jsx`, accept an optional `perRollHe` prop. When provided AND different from the per-resolution value, render it as a smaller subscript:

```
SMART 1.52% / 0.46%
```

- In `BetButton.jsx`, pass both values to Badge

**Acceptance:**

- Place 6 badge shows "SMART 1.52% / 0.46%"
- Hard 6 badge shows "BAD 9.09% / 2.78%"
- Field badge shows just "5.56%" (no subscript — they're equal)
- Pass Line badge shows "SMART 1.41% / 0.42%"

**Constraints:**

- Do not modify `HOUSE_EDGES` itself — add a parallel constant
- Do not change the existing Badge color logic (still based on per-resolution)

---

### Task C.2 — Iron Cross detection in the coach

**Goal:** when the user manually builds an Iron Cross (Field + Place 5/6/8), the coach calls it out without punishing.

**Files:**

- `src/lib/coachEngine.js`

**Spec:**

- Inside `getLocalInstinct`, add a high-priority check (after the bankroll warnings, before the prop-bet warnings):

```js
const isIronCross = b.field > 0 && b.place5 > 0 && b.place6 > 0 && b.place8 > 0;
if (isIronCross && !snap.activeStrategy) {
  return {
    instinct: "When you build an Iron Cross, you're getting an 83% hit rate but paying 6-10× more than Pass+Odds.",
    why: "You win on every number except 7 — it feels great. But the 7 wipes everything, and over time the blended edge is brutal.",
    action: "It's a legit fun choice if you know what you're paying. Just don't mistake it for strategy.",
    risk: "medium",
    risk_note: "Iron Cross detected — entertainment density at the cost of EV.",
    warnings: null,
  };
}
```

- Only fires when no `activeStrategy` is selected (otherwise the strategy guide handles compliance)

**Acceptance:**

- User places Field + Place 5 + Place 6 + Place 8 with no strategy selected → coach fires the Iron Cross message
- Same bets with Veteran selected → coach does NOT fire (lets the strategy guide handle it)
- Field alone → no message
- Field + Place 6 + Place 8 only (missing Place 5) → no message

**Constraints:**

- Do not block the bets
- Do not change other coach branches

---

### Task C.3 — PSO counter + reframed walk warning

**Goal:** track consecutive seven-outs and warn the user about tilt without invoking gambler's fallacy.

**Files:**

- `src/CrapsTrainer.jsx` (add state + reset logic only)
- `src/lib/coachEngine.js`

**Spec:**

- In `CrapsTrainer.jsx`:
  - Add `consecutivePSOs` state (default 0)
  - In `rollDice`, in the seven-out branch, increment it: `setConsecutivePSOs(p => p + 1)`
  - In the point-hit branch (and natural come-out wins on 7/11), reset: `setConsecutivePSOs(0)`
  - Pass `consecutivePSOs` into the coach snapshot
- In `coachEngine.js` `getLocalInstinct`:
  - At the top of the priority chain (just below the bankroll-below-30% check), add:

```js
if (snap.consecutivePSOs >= 5) {
  return {
    instinct: "Five seven-outs in a row is what variance looks like — but your bankroll has taken real damage. Check your numbers before the next bet.",
    why: "Dice have no memory. The next shooter's odds are identical. The problem isn't the table — it's how much of your bankroll has been consumed.",
    action: "Stop. Add up what you've actually lost and decide whether to stay.",
    risk: "high",
    risk_note: snap.consecutivePSOs + " PSOs in a row.",
    warnings: "This is your stop-loss decision point.",
  };
}
if (snap.consecutivePSOs >= 3) {
  return {
    instinct: "Three seven-outs in a row. Reminder: dice have no memory — the next shooter isn't 'due.' But three losses in a row often means you're tilting.",
    why: "Tilt is the real risk after consecutive losses. Your stop-loss is closer than it feels.",
    action: "Take a breath. Worth a short break before the next bet?",
    risk: "medium",
    risk_note: "3 PSOs — tilt risk, not pattern risk.",
    warnings: null,
  };
}
```

**Acceptance:**

- Three seven-outs in a row triggers the 3-PSO message
- Hitting a point or natural come-out win resets the counter
- Five-PSO message replaces the three-PSO message
- The wording does NOT say "the table is cold" or "a 7 is due" — it explicitly disclaims the gambler's fallacy

**Constraints:**

- Do not add any "the dice are cold" or "due for a hit" language anywhere
- The PSO state belongs to `CrapsTrainer.jsx`, not the coach — pass it in via the snapshot

---

### Epic C acceptance summary

After Tasks C.1–C.3:

- Every bet badge shows per-roll edge alongside per-resolution where they differ
- Iron Cross detection fires when the user builds it manually
- PSO counter tracks tilt risk and warns at 3 and 5 consecutive seven-outs
- All warnings frame the math correctly (no gambler's fallacy)

---

## Wave 2 — Polish (deferred, single agent)

These don't fit cleanly in the parallel epics. Pick them up after Wave 1 lands.

- ATS pay table toggle (good vs. reduced) — touches `betLogic.js` and `SetupScreen.jsx`, will conflict with Epic A if done in parallel
- Casino vs. actual rated edge tracker — needs a new component and decisions about average bet tracking
- One-time tooltips explaining per-roll vs per-resolution edge for new users
- Code review of state management in `CrapsTrainer.jsx` — by Wave 2 it may be ready for a `useReducer` consolidation

---

## Appendix A — Shared definitions (do not let these drift between epics)

These values are referenced by multiple epics and must agree across files. If you need to change one, update both the spec and the strategy reference doc.

### House edges (per resolution)

| Bet | HE % |
|---|---|
| Pass / Come | 1.41 |
| Don't Pass / Don't Come | 1.36 |
| Pass + odds, varies by multiple | see strategy reference, section I-C |
| Place 6/8 | 1.52 |
| Place 5/9 | 4.00 |
| Place 4/10 | 6.67 |
| Buy 4/10, vig always | 4.76 |
| Buy 4/10, vig on win | 1.67 |
| Field, 3× on 12 | 2.78 |
| Field, 2× on 12 | 5.56 |
| Hard 6/8 | 9.09 |
| Hard 4/10 | 11.11 |
| Any 7 | 16.67 |

### Bet classification tiers

- **SMART (≤1.5%):** Pass, Don't Pass, Come, Don't Come, all odds, Place 6/8, Buy 4/10 (vig on win)
- **OK (1.5-5%):** Place 5/9, Field (3× on 12)
- **TRASH (>5%):** Place 4/10, Hardways, props, Field (2× on 12), Buy 4/10 (vig always)

### Strategy minimum units (for compatibility check)

- Conservative: 20
- Smart Fun: 25
- Veteran: 30
- 3-Pt Molly: 40

---

## Appendix B — Things explicitly out of scope for v3

- Adding new craps variants (crapless, bubble) — defer
- Persisting session data — locked: no persistence
- Adding new bots beyond Mike/Sarah/Tom — out of scope
- Refactoring inline styles to Tailwind — defer until after v3
- Adding tests — defer until after the code split stabilizes
- Reintroducing the Anthropic API call — locked: rules-only coach

---

## Sources

- `docs/strategy-reference.md` — research that drove all of these decisions
- `src/CrapsTrainer.jsx` — current trainer state
- The cross-analysis discussion in the chat that produced this spec