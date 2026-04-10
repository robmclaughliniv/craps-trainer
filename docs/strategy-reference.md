# Craps strategy reference: research outline and findings checkpoint

This outline reflects actual research findings — specific numbers, source conflicts, and preliminary verdicts — organized for your review before the full write-up. Every section below contains the data that will back the final document. Redirect scope here; the next phase is prose.

---

## I. The math foundation

### I-A. House edge for every bet on the layout

**Key finding:** The Wizard of Odds (Shackleford) expresses craps house edge three ways — per bet made, per bet resolved, and per roll. Most sources only cite per-resolution, which badly distorts comparisons between multi-roll and single-roll bets.

**Data gathered (all from WizardOfOdds.com Appendix 1 & 2, last updated Oct 2023):**

| Bet | HE per resolution | HE per roll |
|---|---|---|
| Pass / Come | 1.41% | 0.42% |
| Don't Pass / Don't Come | 1.36% (1.40% excl. ties) | 0.40% |
| Place 6/8 | 1.52% | 0.46% |
| Place 5/9 | 4.00% | 1.11% |
| Place 4/10 | 6.67% | 1.67% |
| Buy 4/10 (vig on win) | **1.67%** | 0.42% |
| Buy 5/9 (vig on win) | **2.00%** | 0.56% |
| Buy 6/8 (vig on win) | 2.27% | 0.69% |
| Buy any (vig always) | 4.76% | varies |
| Field (3× on 12) | 2.78% | 2.78% |
| Field (2× on 12) | 5.56% | 5.56% |
| Hard 6/8 | 9.09% | 2.78% |
| Hard 4/10 | 11.11% | 2.78% |
| Any Seven | **16.67%** | 16.67% |
| Any Craps | 11.11% | 11.11% |
| Yo / Craps 3 | 11.11% | 11.11% |
| Aces / Boxcars | 13.89% | 13.89% |
| Horn | 12.50% | 12.50% |
| C&E | 11.11% | 11.11% |
| Big 6/8 | 9.09% | 2.78% |
| Fire Bet (Pay Table A) | **20.76%** | — |
| ATS Small/Tall (34:1) | 7.76% | — |
| ATS All (174:1) | 7.99% | — |
| ATS Small/Tall (30:1) | **18.30%** | — |

**Planned for full doc:** A single master reference table with all bets, all three edge expressions, plus hit frequency. This will be the most information-dense table in the document.

### I-B. Per-roll vs. per-resolution: why conflation is the #1 math mistake in craps writing

**Key finding:** Place 6/8 at 1.52% per resolution looks far worse than its 0.46% per-roll cost. Hard 4/10 at 11.11% per resolution is actually 2.78% per roll — a **4× difference**. The Iron Cross's "1.14% house edge" claim uses per-roll math on the place components and per-decision on the field, mixing measurement frames. Wizard of Odds explicitly flags this as "comparing apples to oranges."

**Plan:** Dedicate a subsection to this distinction with a worked example showing how a player evaluating Place 5/9 (4.00% per resolution) vs. Field (2.78%) reaches opposite conclusions depending on which frame they use. The per-roll figure is the better measure for cost-of-money-at-risk.

### I-C. Combined edge: Pass/Don't Pass + free odds

**Data gathered:**

| Odds multiple | Pass + Odds HE | Don't Pass + Lay HE |
|---|---|---|
| 0× | 1.414% | 1.364% |
| 1× | 0.848% | 0.682% |
| 2× | 0.606% | 0.455% |
| 3-4-5× | 0.374% | ~0.273% |
| 5× | 0.326% | 0.227% |
| 10× | 0.184% | 0.124% |
| 20× | 0.099% | 0.065% |
| 100× | 0.021% | 0.014% |

**Critical insight the doc must stress:** The dollar expected loss is **always** 1.414% × flat bet, regardless of odds taken. A $10 Pass player loses $0.14/decision whether taking $0 or $1,000 in odds. Odds dilute the percentage by adding zero-edge action; they do not reduce dollar loss. This is the single most misunderstood fact in craps.

### I-D. Variance and standard deviation by bet type

**Data gathered (SD per unit bet):**
- Pass (no odds): 1.00 | Pass + 3-4-5× odds: **4.916** | Pass + 10× odds: 10.81
- Place 6/8: 1.079 | Field (3× on 12): 1.142 | Any Craps: 2.514
- Yo: 3.665 | Boxcars/Aces: 5.094

**Planned table:** SD per unit for every major bet, plus a "variance class" grouping (low/medium/high/extreme) for quick reference.

### I-E. Why house edge alone is misleading for short sessions

**Key findings:**
- For a 4-shooter session (~34 rolls, ~10 decisions), the expected loss on $10 Pass + 3-4-5× odds is **$1.41** while the SD is approximately **$155**. The house edge is invisible — variance is 100× larger.
- Probability of finishing ahead after 100 Pass decisions: 46% (no odds), 48.9% (3-4-5× odds), 49.9% (100× odds).
- Average shooter lasts **8.53 rolls** (WoO data). A 2-shooter session is ~17 rolls, ~5 decisions.
- In short sessions, **risk of ruin, hit frequency, and bankroll-to-variance ratio** matter more than house edge.

**Planned figure:** Chart showing EV vs. SD as session length increases, with the "crossover" point where edge begins to emerge from noise (roughly 10,000+ decisions).

---

## II. Every bet, rated

### II-A. The tier system

**Plan:** Organize bets into four tiers rather than a linear list:
- **Tier 1 (<1% combined edge):** Pass/Come + odds, Don't Pass/Don't Come + lay odds, Buy 4/10 vig-on-win
- **Tier 2 (1–3%):** Place 6/8, Field (3× on 12), Buy 5/9 vig-on-win
- **Tier 3 (3–10%):** Place 5/9, Place 4/10, Hardways, ATS at good pay tables, Field (2× on 12)
- **Tier 4 (10%+):** Props, Horn, Any Seven, Any Craps, Fire Bet, Big 6/8, Hop bets

### II-B. Buy vs. Place: the vig-timing nuance

**Key finding — this gets its own subsection because it's the most commonly glossed-over distinction:**

| Point | Place HE | Buy (vig always) HE | Buy (vig on win) HE | **Best choice** |
|---|---|---|---|---|
| 4/10 | 6.67% | 4.76% | **1.67%** | Buy (vig on win) |
| 5/9 | 4.00% | 4.76% | **2.00%** | Buy (vig on win) |
| 6/8 | **1.52%** | 4.76% | 2.27% | Place |

**Additional nuance:** At $25 Buy on 4/10, the 5% vig is $1.25. If the casino rounds down to $1, effective HE drops to ~1.33%. **Always ask about vig policy and rounding.**

### II-C. The Don't side: math advantage vs. social cost

**Data:** Don't Pass at 1.36% saves $0.50 per $1,000 wagered vs. Pass at 1.41%. At $10/decision, 30 decisions/hour, the savings is approximately **$0.15/hour**. Multiple sources (Scoblete, WoV forum, TripAdvisor) document social stigma. Wizard of Odds: "If the pass side is more fun, go ahead and bet that way; I won't shake my finger."

**Plan:** Present this as a quantified cost-benefit. The math advantage is real but trivially small. The social cost is unquantifiable but frequently cited. Bubble craps / electronic craps eliminates the social cost entirely.

### II-D. Individual bet profiles

Each gets a mini-profile in the full doc: edge (all three expressions), hit frequency, variance class, when it makes sense, common mistakes, and the "honest verdict."

**Specific notes for the doc:**
- **Big 6/8:** 9.09% HE vs. Place 6/8 at 1.52%. **Never** bet Big 6/8. Include as a "litmus test" — if a player is making this bet, they need more education.
- **Field:** The 2× vs. 3× on 12 distinction doubles the edge (5.56% → 2.78%). Cruise ships often pay only 2×.
- **ATS at good pay tables (34:1/174:1):** At ~8% HE, this is actually the **best craps side bet available** — better than Fire Bet (20.76%). But MGM properties have cut payouts to 30:1/150:1, pushing HE to 18-20%. Always verify the pay table.
- **Fire Bet:** At $1, the per-shooter expected loss is only $0.21. Pure lottery ticket. Probability of all 6 points: 1 in 6,156.
- **Hop bets:** Wide payout variance by casino. Hard hops at 33:1 → HE 5.56%; at 30:1 → 13.89%. Check the pay table.

---

## III. Named systems: survey and critique

### Organizing principle

**Key finding across all systems:** No betting system changes expected value. Wizard of Odds: "Not only do betting systems not overcome the house edge but they can't even put a dent in it." Systems only redistribute variance — they change the distribution of outcomes, not the mean. The full doc will lead with this theorem, then evaluate each system on **what problem it solves and how it reshapes the outcome distribution**.

### III-A. Pass + max odds baseline

**Promoters:** Wizard of Odds, virtually all math-focused authors, Stanford Wong, John Grochowski.
**Combined HE:** 0.374% at 3-4-5×.
**Verdict:** The mathematically optimal baseline. The only debate is Pass vs. Don't Pass (0.05% difference) and how much odds to take.
**What it doesn't solve:** Low entertainment density for action-oriented players. One number working at a time (unless adding Come bets).

### III-B. 3-Point Molly

**Mechanics:** Pass + 2 Come bets, all with max odds. Maintain 3 numbers working.
**Promoters:** Widespread; Wizard of Odds has a dedicated analysis page. Origin unclear — no confirmed inventor.
**HE:** ~0.374% (same as Pass + Odds, since Come = Pass mathematically).
**Total exposure at $10/3-4-5×:** $100–$150+ across three numbers. Bankroll recommendation: $400–$500 per session.
**Key data from Craps Analyst simulations (1M sessions):** Average loss ~$0.85/shooter per $10 unit; win probability per 10-shooter session: ~35-44% depending on odds configuration.
**Partially self-hedging:** A new Come bet wins on 7, which is the seven-out that kills your existing bets. This creates a natural partial hedge.
**Verdict:** Gold standard for multi-number play. Mathematically near-optimal.

### III-C. Iron Cross

**Mechanics:** Field + Place 5/6/8. Wins on 30/36 outcomes (83.3% per roll).
**Combined HE:** 1.14% per roll / ~2.4-3.9% per decision (depends on Field payout).
**Why it's popular:** 83% hit rate feels phenomenal. Wins on every number except 7.
**The catch:** When the 7 hits (16.67% of rolls), you lose the entire $22+ exposure. Over time, the blended edge is **6-10× worse** than Pass + odds.
**Verdict:** Mathematically indefensible as primary strategy. Psychologically compelling for short entertainment.

### III-D. Doey-Don't (Pass + Don't Pass hedge)

**Combined HE:** 2.77% (double the edge, near-zero volatility). Craps Analyst: "The best case scenario (top 1%) is $0 in winnings."
**One legitimate use:** Comp mining and promotional chip extraction. Also useful when table minimum exceeds comfort level.
**Verdict:** Mathematically wasteful for actual play. Legitimate for comp arbitrage.

### III-E. Place 6 & 8 only

**HE:** 1.52% per resolution (0.46% per roll).
**Key advantage over Pass + Odds:** No contract bet — you can take Place bets down at any time.
**Verdict:** Solid conservative choice. Not optimal but very close, and simplicity has real utility. Best way to "jump in" mid-shooter.

### III-F. Regression systems ($66 inside → $22 inside, etc.)

**Promoters:** John Patrick, Heavy (Axis Power Craps), the Dicesetter community.
**What it does:** Does NOT change HE. Manages average bet size and reduces variance.
**The "guaranteed profit" question:** Real for individual hands where you get the initial hit. Illusory over many hands. The $66 initial exposure means MORE money at risk on the first few critical rolls.
**Verdict:** Useful as bankroll management discipline. Psychologically valuable. Mathematically neutral.

### III-G. Pressing systems (collect-press-collect-regress)

**Data from Golden Touch Craps comparison (8 hits):** Up-a-unit wins most consistently for ≤7 hits. Press-half-bet wins most for 8+ hits. Power press has highest ceiling but highest floor risk.
**Key insight:** Pressing is pure variance manipulation — higher highs, lower lows. Mathematically neutral to EV.
**Plan:** Include a table showing bankroll trajectories for full press, half press, and up-a-unit across 1-10 hits on a $12 Place 6.

### III-H. Hedge systems (Pass + Any Craps)

**Math:** Over 360 come-out rolls, Pass expected loss = $50.76; adding $1 Any Craps adds $40.00 in expected loss. Total loss nearly doubles.
**Why it persists:** Dealers actively encourage it. $1 "insurance" feels cheap. The Any Craps win on a 2/3/12 feels smart.
**Verdict:** Every hedge in craps adds a higher-edge bet to "protect" a lower-edge bet, increasing total EV loss.

### III-I. Don't Pass + Lay odds

**HE:** 1.36% (flat), ~0.273% with 3-4-5× lay equivalent.
**Distribution shape:** Lots of small wins, occasional large losses — the **inverse** of Pass side.
**Social cost documented across multiple sources.** Wizard of Odds: technically the mathematical optimum but the 0.05% difference is trivial.
**Interesting finding:** Don't Pass with odds keeps session win PERCENTAGE above 50% — you win more sessions than you lose, but the losses are larger.

### III-J. Power press / aggressive press

**Mechanics:** Full press + adding pocket money. $12 → $30 → $60 → $120 geometric growth.
**Risk/reward:** Most shooters average ~3.5 rolls before seven-out. Need 3+ hits just to break even with standard pressing.
**Verdict:** High-variance entertainment strategy. Only sensible with surplus/profit money.

### III-K. Scoblete's "Captain" system (5-Count)

**How it works:** Don't bet until a new shooter survives 5 "counts." Claims to eliminate 57% of random rollers.
**What skeptics say:** "Losing less because you're betting less frequently is not a news flash." The probability of a 7 on roll N is always 1/6 regardless of history.
**The Captain's existence:** Wizard of Vegas forum investigation (SCAN) found evidence the person existed but described exploits as embellished. Never independently verified.
**Verdict:** A patience mechanism that reduces total action (and therefore total expected loss). Does NOT identify hot shooters. Psychologically useful for preventing impulsive betting.

### III-L. Patrick's progression systems

**Overview:** John Patrick promoted regression/progression patterns and trend-based betting. The regression concepts have genuine value as risk management tools. The trend-following concepts lack mathematical foundation.
**Verdict:** More bankroll management than edge — which is the honest best case for any system.

### III-M. When systems "work" as tools (not edge)

**Plan for full doc subsection on legitimate uses:**
1. Discipline (predetermined patterns prevent emotional betting)
2. Variance management (regression reduces volatility; progression increases it)
3. Session structuring (systems create natural decision points)
4. Comp extraction (some systems efficiently generate rated action)
5. Risk of ruin management (identical HE, dramatically different bust probabilities)

---

## IV. Bankroll and session management

### IV-A. Risk of ruin: worked examples

**Formula:** RoR = exp(−2 × μ × B / σ²), where μ = expected win rate/decision, B = bankroll in units, σ² = variance/decision. Source: Malmuth's *Gambling Theory*; Schlesinger's *Blackjack Attack* (trip ruin formula).

**Worked examples ($10 Pass Line, no odds, 1-hour session ~48 decisions):**

| Buy-in | Units | Expected loss | Session SD | P(bust) | P(ahead) |
|---|---|---|---|---|---|
| $100 | 10 | $6.77 | $69 | ~20-25% | ~46% |
| $200 | 20 | $6.77 | $69 | ~10-12% | ~46% |
| $500 | 50 | $6.77 | $69 | ~1-2% | ~46% |

**With 3-4-5× odds, risk of ruin changes dramatically:**
- $100 buy-in: ~2.5 effective units → RoR **~80%+** (essentially suicide betting)
- $200 buy-in: ~5 effective units → RoR ~35-45%
- $500 buy-in: ~12.5 effective units → RoR ~8-12%

**Critical takeaway:** "If you can't afford full odds, you're at too high a table minimum" (Wizard of Vegas forum consensus).

### IV-B. Session vs. trip vs. lifetime bankroll

**Plan:** Brief conceptual framework. Session = entertainment budget for one sitting. Trip = total allocation, divided among planned sessions. Lifetime = monthly/annual entertainment allocation. The mathematical truth: in a negative-EV game, the lifetime bankroll trends toward zero. The practical truth: treat session buy-ins as entertainment expenses.

### IV-C. Stop-loss and win-goal frameworks

**Academic finding:** The optional stopping theorem (martingale theory) proves no stopping rule can turn a negative-EV game positive. Stop-losses reduce total expected loss **only** by reducing total action — mathematically equivalent to choosing to play fewer hands. Per Wizard of Odds: money management "changes the distribution of outcomes, not the expected value."

**Prospect theory connection:** Kahneman & Tversky's work predicts exactly the stopping behavior we observe — people cash out gains early and ride losses.

### IV-D. Stress-testing the reader's four principles

#### Principle A: "Coverage beats edge optimization for short sessions (2-4 shooters)"

**VERDICT: Mostly false, with a narrow exception.**

Coverage (e.g., Iron Cross at ~3.87% per decision) does NOT beat edge optimization (Pass + 3-4-5× odds at 0.374%) on any mathematical metric — not expected value, not probability of profit, not risk-adjusted return — even in sessions as short as 2 shooters. Simulation data from multiple forum analyses shows the probability of walking away a winner in a 20-roll session: Iron Cross ~40-45%; Pass + full odds ~45-48%. **The lower-edge strategy wins on every measure.**

**The narrow exception:** Coverage provides more predictable per-roll outcomes (lower roll-to-roll volatility). If the player's goal is specifically "minimize the chance of standing at a table watching numbers hit without collecting anything," coverage achieves that emotional goal — but at a measurable mathematical cost (6-10× higher aggregate house edge). Coverage buys entertainment consistency at the price of EV. **It never overcomes the higher edge, even in very short sessions.**

**What the full doc will say:** Present this as a cost-benefit. The premium for coverage is quantifiable. At $22 Iron Cross vs. $10 Pass + $40 odds, the entertainment consistency premium is approximately $1-2/decision in additional expected loss.

#### Principle B: "Ratcheting stop-loss: advance floor every ~$50 of profit"

**VERDICT: Mathematically neutral, behaviorally excellent.**

Each future bet has identical negative EV regardless of prior results. The ratchet does not change EV. What it does:
- Compresses upside (exits some sessions before potential extended hot streaks)
- Locks moderate wins (converts potential big winning sessions into moderate ones)
- Reduces total action (fewer bets placed = less total expected loss)
- Creates more winning sessions (but with smaller average winning amounts)

Thaler & Johnson (1990) documented both the "house money effect" (winners become reckless) and the "break-even effect" (losers chase). **The ratcheting stop-loss directly addresses both pathologies.** It prevents winners from giving everything back and creates clear decision points.

**Comparison:** Very similar in function to a trailing stop in trading. Fixed stop-loss protects downside only. No stop-loss maximizes variance and total expected loss. The ratchet is the strongest discipline tool among the three.

**What the full doc will say:** Endorse this as one of the most defensible discipline mechanisms for recreational players. Note the only downside: occasionally walking away from a table about to produce an epic roll.

#### Principle C: "Walk after 3 consecutive seven-outs"

**VERDICT: Statistically baseless, practically useful — but reframe the reasoning.**

Zero statistical basis. Dice have no memory. Three consecutive seven-outs do not make the fourth more or less likely. This is textbook gambler's fallacy (Tversky & Kahneman, 1974; Croson & Sundali, 2005).

**However, it's a genuinely useful discipline mechanism because:**
1. It functions as an implicit stop-loss (3 PSOs typically = $30-90 in losses depending on bets)
2. It limits session duration during cold stretches (~10-15 minutes)
3. It prevents tilt (3 consecutive losses creates frustration → poor decisions)
4. It's dead simple → high compliance rate

**What the full doc will say:** Don't walk because "the table is cold" (wrong reasoning). Walk because "I've lost enough to trigger my stop-loss and my emotional state may be compromised" (right reasoning, identical action). The full doc should present both the honest math and the behavioral reframe.

#### Principle D: "Soft exposure ceiling ~$40 on a $100-$200 buy-in"

**VERDICT: Reasonable on $200 (20% of bankroll), aggressive on $100 (40%).**

Kelly Criterion is **inapplicable** to negative-EV games (it says bet $0). Fractional Kelly provides no guidance either. Standard bankroll-percentage rules recommend 1-5% per wager for long-term survival, but craps involves simultaneous bets, making per-wager rules awkward.

- **$40 on $100 (40%):** A single seven-out wipes 40% of the buy-in. Only ~2-3 "shots" before bust. Functional but razor-thin margin.
- **$40 on $200 (20%):** Provides ~5 losing cycles before bust. Consistent with practical craps authors' recommendations for short sessions. Well-calibrated for 2-4 shooter play.

**What the full doc will say:** Endorse the $40 ceiling at $200 buy-in. Flag $100 buy-in as requiring either reduced exposure ($20-25) or increased buy-in. Present the "number of surviving seven-outs" as the more intuitive metric than percentage of bankroll.

### IV-E. Short vs. long session mathematical differences

**Data gathered:**

For $10 Pass, no odds:
- 30-min session (~24 decisions): EV = −$3.38, SD = $49. **P(profit) ≈ 47%**
- 2-hour session (~96 decisions): EV = −$13.54, SD = $98. **P(profit) ≈ 44%**
- 8-hour session (~384 decisions): EV = −$54.14, SD = $196. **P(profit) ≈ 39%**

For $10 Pass + 3-4-5× odds, 24-decision session: EV = −$3.38, SD = **$241**. **P(profit) ≈ 49.4%** — virtually a coin flip.

**Key insight for the doc:** Expected loss grows linearly (n), SD grows with √n. In short sessions, SD >> EV. The house edge is statistically invisible. This is quantifiably why recreational players can and do walk away winners regularly.

### IV-F. "Playing with the casino's money"

**Academic finding:** Thaler & Johnson (1990), *Management Science*: documented the house money effect — after gains, people become more risk-seeking. Mathematically irrelevant (won money = your money). Psychologically real.

**Verdict for doc:** A double-edged tool. Useful when paired with the ratcheting stop-loss (press with surplus but lock floors). Dangerous when it leads to returning all profits. Frame honestly: "All money in your rack is yours. The question is how much of your gains you're willing to put back at risk."

---

## V. Pressing, regression, and money management patterns

### V-A. Core principle

No money management system changes EV. They change the distribution of outcomes. This section is about choosing your variance profile.

### V-B. The patterns (planned subsections)

1. **Full press** (double after win): Exponential growth if streak continues; $12 → $24 → $48 → $96 on Place 6. Four consecutive hits = $402 vs. $56 from collecting. But most shooters average ~3.5 rolls.
2. **Half press** (add half back, pocket half): Slower growth, money comes off each hit. Golden Touch analysis: outperforms up-a-unit after 8+ hits; underperforms below 7 hits.
3. **Power press** (cross-number pressing plus pocket money): Highest ceiling, highest risk.
4. **Regression after win** ($66 inside → $22 inside): One hit pays $21, regress to $22, net exposure $1. Subsequent hits are "near-free-rolls." Does not change EV but dramatically compresses variance.
5. **"Take it down" decisions:** Forum consensus: 2 hits and regress is the standard regression point. After 1 hit: too conservative (partial loss locked). After 3+: unnecessary delay.
6. **The pressing-vs-collecting tension:** Risk-averse → collect/regress. Thrill-seeking → press. Hybrid (collect first 1-2 hits, then press) is the dominant recreational strategy.

**Planned table:** Side-by-side bankroll trajectories for 5 pressing patterns across 1-10 hits on $12 Place 6.

---

## VI. Dice influence and setting

### VI-A. Claims landscape

| Proponent | Key claim | Claimed SRR | Financial interest |
|---|---|---|---|
| Stanford Wong | Correlation shooting possible | 6.3-7.0 | Book sales (*Wong on Dice*, 2005) |
| Frank Scoblete | "The Captain" beat craps | Unspecified | Books, $1,695 Golden Touch seminars |
| Dominator (LoRiggio) | P(7) reducible to 16.05% | ~6.2 | Golden Touch instructor |
| Chris Pawlicki | Physics-based control | Unspecified | *Get the Edge at Craps* (2002) |
| Jerry Patterson | PARR rhythm roll | Unspecified | PARR course |

### VI-B. The evidence (this is where the doc goes deep)

**Wong Experiment (2004):** 500 rolls by Wong + Little Joe. Result: 74 sevens (expected 83.33). **P-value = 0.144 — NOT statistically significant.** About 1 in 7 random trials would produce this result. Wong won his bets ($2,000 from Bob Dancer, $1,800 from Wizard of Odds).

**The critical follow-up:** Little Joe ran a second 1,000-roll test. **"Failed miserably."** Combined 1,500 rolls: sevens "almost exactly" at random expectations. Wong argued the second test should be discarded — obviously self-serving reasoning.

**UNLV Machine Experiment (Scott & Smith, 2019-2020):** Built a custom dice-throwing machine ("Lucky Lil'") mimicking expert biomechanics. **7,557 throws. Failed to achieve statistical significance.** Even a purpose-built machine could not produce non-random results.

**Ethier (2025, arxiv):** Rigorous mathematical framework for testing dice control. Reviewed all existing evidence. **Found none achieved statistical significance.**

**Bryce Carlson (2011, Las Vegas Advisor):** Physics-based critique. Kinetic energy ∝ v² means small differences in initial conditions produce large outcome differences. Slow-motion video of expert throws shows "a huge amount of uncontrollable randomizing."

**Wong's later position (2009):** Acknowledged slow-motion evidence shows randomizing. Eventually stated "the potential profit is not worth the time spent."

### VI-C. Where consensus sits

**Mainstream math community:** Overwhelmingly skeptical. Wizard of Odds won't fully rule it out (deference to Wong) but remains personally skeptical.

**Casino industry:** Not worried at all. Allow dice setting. Host Golden Touch seminars on premises. Do NOT ban dice setters (unlike card counters, who demonstrably have an edge). **This is the most telling indicator.**

**Break-even SRR:** ~6.04 for Pass + 3-4-5× odds (only 0.67% fewer sevens than random). Sounds achievable — but nobody has demonstrated it under controlled conditions, and a machine couldn't do it.

### VI-D. Honest recommendation for doc

**Don't invest significant money or time pursuing dice control for edge.** The evidence, physics, machine experiments, and casino indifference all point one direction. If you enjoy the ritual of setting dice, it's free and harmless — just don't increase bets because of it, and don't spend $1,695 on a seminar.

---

## VII. Comps, ratings, and casino economics

### VII-A. The theoretical loss formula

**Average Bet × Decisions/Hour × Assumed HE × Hours Played**

Key parameters:
- Decisions/hour: ~48 pass-line decisions; ~150 total rolls
- Casino-assumed HE: typically **1.75%** (higher than actual 1.41% — they assume some prop/place action)
- **Most casinos do NOT rate odds bets** (0% edge). This is THE comp advantage for craps players.
- Comp return: 10-40% of theoretical loss (old standard 30-40%; modern often 10-20%)

### VII-B. Maximizing comp value

**Key strategies found:** Largest bets when pit boss is watching; tip dealers (confirmed by dealers to influence ratings upward); play at full tables (slower pace = fewer decisions = less actual loss at standard-speed rating); use the Pass + max odds structure (high total action but low actual edge, and odds often not rated).

**Craps as best comp game:** Strong case. The gap between casino-assumed edge and actual edge with odds is the widest in the house.

### VII-C. Cruise ship craps

**Key findings:**
- Odds typically restricted: 1× (Royal Caribbean standard), 2× (Carnival), 3-4-5× (Norwegian — the outlier)
- **Field bet trap:** Many cruise ships pay only 2× on both 2 and 12, doubling field HE from 2.78% to 5.56%
- Table minimums: $5-$10, occasionally $15
- Comp structure: extremely stingy; bounce-back cruise offers are the main currency
- **Overall verdict: cruise ship craps is materially worse for the player** (restricted odds, worse payouts, poor comps)
- **Norwegian Cruise Lines is the notable outlier** with 3-4-5× odds on some ships

---

## VIII. Table selection and game rules

### VIII-A. Odds multiples impact (with numbers)

This repeats the I-C table but the full doc will frame it as a table-selection decision tool: "Moving from a 2× odds table to a 10× odds table cuts your combined HE from 0.606% to 0.184% — a 3.3× improvement for free."

### VIII-B. Crapless craps

**House edge: 5.382%** — 3.8× higher than standard craps. The 11 becoming a point (25% make rate vs. instant winner) is the primary culprit. **Avoid unless only option available.** If forced to play: Place 6/8 (same 1.52% as standard craps) and minimum Pass bets.

### VIII-C. 3-4-5× vs. flat multiples

**3-4-5× combined HE: 0.374%.** Flat 5× combined HE: 0.326%. Flat 3× combined HE: 0.471%.
3-4-5× is between flat 3× and flat 5×, closer to 5×. The practical advantage: equalized payout of exactly 6× the flat bet regardless of point, simplifying dealer math and table operations.

### VIII-D. Table-selection checklist

**Planned for doc:** A quick-reference checklist of rules to verify before sitting down (odds multiples, buy vig policy, field payouts, ATS/Fire pay tables, minimum bets relative to bankroll).

---

## IX. Tipping, etiquette, and table dynamics

### IX-A. Tipping conventions

**How to tip (two methods):** Direct tip ("hand-in") or dealer bet (preferred — creates shared excitement). Best dealer bets: Pass line piggyback ($1-$2), Place 6/8 for dealers. Avoid prop bets for dealers (wastes tip to house edge).

**Amount:** For $10 bettors, $1 dealer bet periodically. For $25 bettors, $5 dealer bet or $12 Place 6&8 for crew. Budget ~5-10% of winnings or $5-10/hour minimum while winning.

### IX-B. Etiquette mistakes

**Top violations found across sources:** Hands on felt during throw (#1), saying "seven," late bets, buying in during a roll, two-handing the dice.

### IX-C. Does crew rapport affect the game?

**Verdict: Yes, practically.** Dealers confirmed: tippers get higher average-bet ratings (better comps), more lenient treatment on borderline calls, more time for bet placement, and dice positioned favorably. One dealer explicitly stated floor supervisors who share tips "rate you a little higher when you are tipping."

### IX-D. Hot/cold table reading

**Verdict: Pure narrative with no predictive value.** Each roll is independent. Streaks are mathematically expected in random sequences (Croson & Sundali, 2005: field study of real casino gamblers). Confirmation bias is the primary driver of hot/cold beliefs.

**The only actionable insight:** If the table "temperature" is affecting your emotional state (tilting on cold, overconfident on hot), leaving is beneficial — not because the table will stay cold/hot, but because your decision-making is compromised.

---

## X. Psychological and behavioral factors

### X-A. Tilt patterns

**Four craps-specific tilt patterns identified:** Chasing losses after seven-outs, escalating bets after wins (house money effect), the "one more shooter" trap, and abandoning press discipline during hot rolls.

### X-B. Shooter vs. non-shooter psychology

**Academic finding:** Langer (1975) established the "illusion of control" concept using craps as a primary example. Davis, Sundahl & Lesbo (2000): players bet more when personally throwing. Henslin (1967): players throw harder for high numbers, softer for low — despite no effect on outcomes.

**Practical implication for doc:** Self-aware players should consciously maintain identical bet sizing and strategy whether shooting or not.

### X-C. How variance feels vs. what it is

**The core paradox:** A $10 player with $54 in bets expects to lose ~$4/hour but experiences $100-300+ bankroll swings per session. SD is 10-50× larger than EV. Session outcomes are 95%+ determined by luck and ~5% by house edge.

### X-D. Cognitive traps

**Planned subsection on each:** Gambler's fallacy ("7 is due"), hot hand fallacy ("this shooter is hot" — pure fallacy in craps; unlike basketball, dice outcomes are not human performance), sunk cost in pressing, confirmation bias (remembering hot rolls, forgetting cold ones), and anchoring (using peak chip count instead of buy-in as reference point).

### X-E. The entertainment value framework

**Finding:** $10 Pass + 3-4-5× odds costs ~$4-7/hour in theoretical loss. Compare: movie ($8-10/hr), concert ($33/hr), golf ($20/hr). Craps is competitive entertainment value when framed correctly. This framing reduces loss-chasing and creates natural session boundaries.

---

## Stress-test verdicts summary

| Principle | Verdict | Short version |
|---|---|---|
| A. Coverage beats edge optimization (short sessions) | **Mostly false** | Coverage never overcomes higher aggregate edge, even in 2-shooter sessions. Buys entertainment consistency at 6-10× the EV cost. |
| B. Ratcheting stop-loss (advance floor every ~$50) | **Mathematically neutral, behaviorally excellent** | Doesn't change EV but directly addresses house money effect and break-even effect. One of the most defensible discipline tools available. |
| C. Walk after 3 consecutive PSOs | **Statistically baseless, practically useful** | Zero predictive value (gambler's fallacy). Functions as implicit stop-loss + tilt prevention. Reframe the reasoning; keep the behavior. |
| D. Soft exposure ceiling ~$40 | **Reasonable at $200 buy-in (20%), aggressive at $100 (40%)** | Kelly inapplicable. At $200, provides ~5 losing cycles. At $100, only ~2-3 shots before bust — consider $20-25 ceiling or higher buy-in. |

---

## Areas where sources disagree or the answer is genuinely "it depends"

1. **Per-roll vs. per-resolution edge:** Sources use these interchangeably, creating wildly different impressions of the same bets. **The doc must pick one as primary and always flag which is being used.**

2. **Don't Pass vs. Pass:** Wizard of Odds says Don't is technically optimal; most practical authors say the 0.05% difference is meaningless. **Depends on:** how much the player values social dynamics vs. mathematical purity.

3. **Dice influence:** Wong says possible (weakly); Wizard of Odds says "not ruling it out"; Carlson says impossible; UNLV machine experiment says it failed. **Depends on:** whose physics argument you trust. Weight of evidence: almost certainly not achievable under casino conditions.

4. **Coverage vs. concentration in short sessions:** Math clearly favors concentration. But the "never collecting while numbers hit" complaint from Pass-only players is experientially real. **Depends on:** whether the player's utility function weights entertainment consistency or EV optimization more heavily.

5. **Stop-losses generally:** Academic math says they can't change EV. Behavioral research says they improve real-world outcomes by preventing tilt. **Depends on:** whether you measure "outcomes" as expected value or as actual behavioral results from imperfect humans.

6. **ATS bet value:** Ranges from ~8% HE (good pay tables) to ~20% HE (reduced payouts) depending on casino. The bet is either the best or worst craps side bet. **Depends on:** the specific pay table in front of you.

7. **Buy bet vs. Place bet on 5/9:** Buy wins at 2.00% only if vig is charged on win. If vig is always charged (4.76%), Place is better at 4.00%. **Depends on:** the specific casino's vig policy.

---

## Tables and figures planned for the full document

1. **Master bet reference table:** Every bet, three edge expressions, hit frequency, variance class, verdict
2. **Pass + Odds combined edge table:** 0× through 100× for both Pass and Don't Pass
3. **Buy vs. Place decision matrix:** By point number and vig policy
4. **Risk of ruin table:** By buy-in level, with and without odds
5. **Named systems comparison matrix:** HE, variance profile, what it solves, verdict
6. **Pressing pattern trajectories:** Bankroll curves for 5 patterns across 1-10 hits
7. **Short vs. long session math:** EV, SD, P(profit) at various session lengths
8. **Dice influence evidence summary:** Study, sample size, result, p-value
9. **Cruise ship rules comparison:** By cruise line (where data exists)
10. **Cognitive trap quick-reference:** Trap, trigger, reality check
11. **Table-selection checklist:** Rules to verify before sitting
12. **Session management decision tree:** Incorporating the four stress-tested principles

---

## Suggested scope adjustments based on research

1. **Promote Buy vs. Place vig nuance to a standalone subsection.** The research shows this is the single most practically impactful piece of information most players don't know. The difference between Buy 4/10 vig-on-win (1.67%) and Place 4/10 (6.67%) is **4×** — far larger than the Pass/Don't Pass debate that gets far more attention.

2. **Add a "what the casino assumes vs. what you're actually paying" subsection in the comps section.** The gap between casino-rated HE (1.75%) and actual HE with odds (0.374%) is the hidden comp advantage. Worth quantifying explicitly.

3. **Consider splitting Section III (Named Systems) into two parts:** "Low-edge systems" (Pass + Odds, 3-Point Molly, Don't Pass + Lay) and "Entertainment systems" (Iron Cross, regression, pressing patterns). This frames the choice as an informed spectrum rather than a right/wrong binary.

4. **Expand the "it depends" framing throughout.** The audience can handle nuance. Rather than declaring any system "bad," present the cost of each choice in quantified terms and let the reader decide.

5. **Deprioritize Crapless Craps coverage** — it's uncommon enough that a brief paragraph suffices. Redirect that space toward ATS/Fire Bet pay table analysis, which the research shows is genuinely variable and impactful.

6. **Add a brief "electronic/bubble craps" note.** Multiple sources flag bubble craps as the solution for Don't players who want to avoid social friction. Lower minimums (often $3-5) and faster pace are additional advantages worth mentioning.

---

## Citations gathered

**Primary math authority:**
- Wizard of Odds (wizardofodds.com): Appendix 1 (bet listing), Appendix 2 (per-roll edge), Appendix 3 (dice setting), Appendix 4 (dice control advantage), Appendix 5 (ATS), Fire Bet page, Crapless Craps page, session simulator, Ask the Wizard #326 (Iron Cross)

**Books and published authors:**
- Frank Scoblete, *Beat the Craps Out of the Casinos* (1991); *Casino Craps: Shoot to Win!*; *I Am a Dice Controller* (2015)
- Stanford Wong, *Wong on Dice* (2005)
- Chris Pawlicki, *Get the Edge at Craps* (2002)
- Don Schlesinger, *Blackjack Attack* (2004) — trip ruin formula, p.132
- Mason Malmuth, *Gambling Theory and Other Topics* — risk of ruin formula
- Bill Chen & Jerrod Ankenman, *The Mathematics of Poker* (2006)

**Academic papers and peer-reviewed work:**
- Smith & Scott, "Golden Arm: A Probabilistic Study of Dice Control in Craps," UNLV Gaming Research & Review Journal (2018)
- Scott & Smith, "Pair-a-Dice Lost: Experiments in Dice Control," UNLV Gaming Research & Review Journal (2020) — 7,557 machine throws
- Ethier, "Testing for Dice Control at Craps," arxiv (2025)
- Thaler & Johnson, "Gambling with the House Money," *Management Science* 36(6): 643-660 (1990)
- Thaler, "Mental Accounting Matters," *Journal of Behavioral Decision Making* 12: 183-206 (1999)
- Langer, "The Illusion of Control," *Journal of Personality and Social Psychology* (1975)
- Tversky & Kahneman, "Judgment under Uncertainty: Heuristics and Biases," *Science* (1974)
- Croson & Sundali, "The Gambler's Fallacy and the Hot Hand," *Journal of Risk and Uncertainty* 30(3) (2005)
- Bryce Carlson, "Why Casino Craps Can't Be Beaten," Las Vegas Advisor (2011)

**Simulation and analysis:**
- Craps Analyst (crapsanalyst.com): 1M-session simulation data on 3-Point Molly and Doey-Don't
- S. Rabbani, "Craps: Computing the Distribution of the Pass-Line and Free Odds Bets" (srabbani.com)
- Sean Kent / University of Wisconsin: Craps simulation blog (pages.stat.wisc.edu)
- Golden Touch Craps: pressing pattern analysis
- Axis Power Craps forums: regression strategy discussions

**Casino operations and comps:**
- Gaming and Destinations (gaminganddestinations.com): theoretical loss formula
- Easy Vegas (easyvegas.com): comp strategies
- CrapsFest / Dicesetter community: rating methodology
- Wizard of Vegas forums: dealer-confirmed comp practices
- Cruzely (cruzely.com): cruise ship casino rules

---

*This outline reflects research findings, not placeholders. All numbers are sourced. The stress-test verdicts are evidence-based. Review the scope, structure, and verdicts — then redirect before the full write-up.*