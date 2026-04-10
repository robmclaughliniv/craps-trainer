# Craps Trainer v3 — Feature Spec

Derived from cross-analysis of `craps-trainer-2.jsx` against the Craps Strategy Reference research document. This spec is the agreed scope for the next iteration of the trainer.

## Locked decisions

- **20× table minimum buy-in rule** replaces the fixed $40 exposure ceiling
- **"Smart Fun" strategy** added as 4th option (Pass + max odds + opportunistic 6/8 + one Come bet)
- **Always max odds** is baked into all strategies — the "skip odds" path is removed
- **Coverage tax surfaced honestly** in the Veteran strategy card

---

## P0 — Ship first (high impact, low effort)

### 1. Buy vig policy toggle

**Setup screen:** New option "Buy bet vig: charged on win only / charged always (default)"

**Logic change:**

- Vig-on-win: HE for Buy 4/10 = **1.67%**, Buy 5/9 = **2.00%**, Buy 6/8 = **2.27%**
- Vig-always: current behavior (4.76% across the board)

**Bet classification:**

- When vig-on-win is set, Buy 4/10 moves to **SMART tier** (was OK)
- Update Badge color and rating engine accordingly

**UI:** Buy 4/10 should now be a legitimately recommended bet under Smart Fun when point is 4 or 10.

---

### 2. Field 2× / 3× on 12 toggle

**Setup screen:** New option "Field pays on 12: 2× / 3× (default)"

**Logic change:**

- 2×: HE = **5.56%**, payout on 12 = 2× bet
- 3×: HE = **2.78%**, payout on 12 = 3× bet (current behavior)

**Bet classification:**

- 2× moves Field down to TRASH tier
- 3× keeps Field in OK tier

**Why:** Cruise ship play almost always uses 2×. Trainer should match the actual game being practiced.

---

### 3. 20× rule warning at setup

**Setup screen:** New "Table Minimum" field ($5 / $10 / $15 / $25)

**Validation logic:**

- Calculate `units = bankroll / tableMin`
- If units < 20: yellow warning **"Undercapitalized. With $X at a $Y table, you have Z units. Recommended: 20+ units. Either find a $A table or buy in for $B."**
- If units < 10: red warning **"Critically undercapitalized. ROR is severe at this ratio."**
- Allow override but make it visible

**Display in main UI:** Add "Units: X" stat in header next to bankroll. Color it green (20+), yellow (10-19), red (<10).

**Replaces:** The current Bankroll Zone "exposure %" thinking. Keep the zone but recalibrate triggers around units, not raw bankroll percentage.

---

### 4. Coverage cost line on Veteran card

**Strategy guide UI:** When Veteran is selected, add a small text line under the steps:

> *"Coverage tax: ~$1.20/decision more than Pass+Odds. You're trading EV for entertainment density. Smart Fun is the lower-cost alternative."*

Color it amber, not red. It's a trade, not a mistake.

---

### 5. Smart Fun strategy (4th strategy)

**Strategy ID:** `smartfun`
**Label:** "Smart Fun"
**Short:** "Pass + Smart Coverage"
**Color:** `#00bcd4` (cyan, distinct from the other three)

**On-strategy bets:**

```js
["pass", "passOdds", "place6", "place8", "come", "comeOdds"]
```

**Step engine logic:**

*Come-out phase:*

1. Place Pass Line ($X)
2. Wait for point

*Point phase, point IS 6:*

1. Pass Line on 6 ✓
2. Max odds on Pass
3. Place 8 (skip Place 6 — it's the point)
4. Hold

*Point phase, point IS 8:*

1. Pass Line on 8 ✓
2. Max odds on Pass
3. Place 6 (skip Place 8 — it's the point)
4. Hold

*Point phase, point IS 4/5/9/10:*

1. Pass Line on [point] ✓
2. Max odds on Pass
3. Place 6
4. Place 8
5. Optional: One Come bet to add a 4th number cheaply (1.41% beats placing the outside numbers at 4-6.67%)
6. Max odds on Come point when it travels
7. Hold

**Rules baked in:**

- Never place 4/5/9/10 — those are the coverage tax
- Max one Come bet at a time (no Molly-style stacking)
- Press rule (optional, doesn't affect strategy compliance): collect first hit, press second hit once, then collect

**Compliance tracking:**

- `isOnStrategy` returns true for: pass, passOdds, place6, place8, come, comeOdds
- Returns false for: place4, place5, place9, place10, all field/props/hardways/buy
- This means the bet efficiency grader will catch deviations

**Strategy card text:**

> *"The fun strategy that keeps the math honest. Always 2-3 numbers working, never the high-edge outside numbers. Worst bet you'll make is 1.52%."*

---

## P1 — Strategy intelligence

### 6. Per-roll edge alongside per-resolution

**Display change:** Every bet badge shows two numbers when relevant.

Format options to consider:

- `1.52% / 0.46%` (per-resolution / per-roll)
- Tooltip on hover/tap
- Toggle in settings

**Recommendation:** Show both inline on the bet badge, smaller font for per-roll. Add a one-time tooltip explaining the difference on first session.

**Bets where it matters most:**

- Place 6/8: looks 1.52% but costs 0.46% per roll
- Hardways: looks 9-11% but costs 2.78% per roll
- Field: 5.56% / 5.56% (same — one-roll bet)
- Props: same (one-roll bets)

---

### 7. Iron Cross detection

**Logic:** When the user has Field + Place 5 + Place 6 + Place 8 active simultaneously (with no other strategy selected), the coach should fire a specific message:

> *"That's an Iron Cross. 83% hit rate feels great but you're paying 6-10× more than Pass+Odds in the long run. Fun for short sessions if you know what you're buying."*

Don't punish, just inform. Iron Cross is a legit "I want fun, I know the cost" choice.

---

### 8. PSO counter with reframed walk-warning

**State:** Track `consecutivePSOs` — increments on seven-out, resets on point made or natural win.

**Trigger at 3:** Coach fires:

> *"Three seven-outs in a row. Reminder: dice have no memory, the next shooter isn't 'due.' But three losses in a row often means you're tilting and your stop-loss is closer than it feels. Worth a break?"*

**Trigger at 5:** Stronger:

> *"Five PSOs. This is what variance looks like — it's not the table, it's the dice. But your bankroll has taken real damage. Check your numbers before the next bet."*

---

### 9. Strategy + buy-in compatibility check

**Logic:** When user selects a strategy, check minimum bankroll requirements:

| Strategy | Minimum recommended buy-in (at table min) |
|---|---|
| Conservative | 20× table min |
| Smart Fun | 25× table min |
| Veteran | 30× table min |
| 3-Pt Molly | 40× table min |

**If insufficient:** Yellow warning under strategy card:

> *"Molly typically needs 40× table min ($400 at $10 tables). You have $100. Consider Conservative or Smart Fun instead."*

Don't block selection — warn and let them proceed.

---

## P2 — Setup sophistication

### 10. ATS pay table toggle

**Setup screen:** "ATS pays: 34:1 / 174:1 (good) / 30:1 / 150:1 (reduced)"

**Logic:** Reduced pays bumps All Small/Tall HE from 7.76% to 18.30%, All Numbers from 7.99% to ~20%.

**UI:** When reduced is selected, ATS bets get TRASH tier badges instead of MEH.

---

### 11. "Survivable seven-outs" stat

**Replace or augment exposure %** in Bankroll Zone with a more intuitive metric:

> *"You can survive ~3 more seven-outs at current exposure"*

**Calculation:** `Math.floor(bankroll / currentTotalExposure)`

This is dramatically more intuitive than "32% exposure."

---

### 12. Casino vs. actual rated edge tracker

**New widget (low priority):** Shows during session:

> *"Casino thinks you're losing $4.20/hour. You're actually losing $0.95/hour. Comp value gap: $3.25/hour."*

**Calculation:**

- Casino assumed: average bet × 48 decisions/hour × 1.75%
- Actual: total bets made × actual blended HE
- Display the gap as "comp arbitrage"

This is the hidden craps advantage and worth surfacing.

---

## Personal strategy doc updates

These aren't code changes — they're updates to the mental model and personal strategy notes:

1. **Drop:** "Skip or minimize odds due to tight bankroll"
   **Add:** "Always max odds. If I can't afford full odds, the table minimum is wrong, not the strategy."

2. **Replace:** "$40 exposure ceiling on $100-$200 buy-in"
   **With:** "Buy in for at least 20× table minimum. Exposure ceiling scales: 30-40% of bankroll once odds are taken."

3. **Reframe:** "Walk after 3 consecutive seven-outs because the table is cold"
   **To:** "Walk after 3 consecutive seven-outs because I'm probably tilting and my stop-loss is closer than I think. The dice don't care."

4. **Acknowledge:** "I knowingly pay a coverage tax for entertainment density. Smart Fun is my default; Veteran is for long sessions where the entertainment matters more than the EV."

5. **Keep unchanged:** Ratcheting stop-loss every $50 profit. Collect-collect-press with 2-press cap. Walk after 3 seven-outs (with reframed reasoning).

---

## Shipping order

- **P0** (5 features) — meaningful trainer upgrade matching real play. Tight first PR.
- **P1** (4 features) — sharpens the intelligence layer. Follow-up PR.
- **P2** (3 features) — polish. When bored.

---

## Sources

- `Craps_Strategy_Reference__Mathematical_Analysis__Systems_Critique__and_Bankroll_Management.md` (project files)
- `craps-trainer-2.jsx` (current trainer state)
- Cross-analysis discussion (this chat)
