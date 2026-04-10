# Craps Trainer

A personal craps strategy training platform. Practice bet management, strategy discipline, and bankroll instincts against a realistic craps engine — solo or at a simulated table with rotating bot shooters.

Built as a single-file React component with a built-in rules-based instinct coach. No external services, no data persistence — everything runs locally in the browser.

## What it does

- **Full craps engine** — Pass/Don't Pass, Come/Don't Come with odds, Place, Buy, Field, Hardways, Props, Horn, C&E, All Small/Tall/Numbers
- **Three named strategies** with live checklists: Conservative, Veteran, 3-Point Molly
- **Instinct coach** — rules-based, fires after every roll, adapts to bankroll/exposure/strategy compliance
- **Shooter rotation** — you + Mike, Sarah, Tom; dice rotate clockwise on seven-out, auto-pause on each resolved bet so you can adjust before the next roll
- **Visual table view** with chips, exposure map, bankroll zone, bet efficiency grade
- **Session scorecard** when you wrap up — discipline grade, biggest leak, smart vs. trash bet ratio
- **Sound + stickman calls** (off by default; toggle in header)

## Quick start

Requires Node 18+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

For a production build:

```bash
npm run build
npm run preview
```

## Project structure

```
craps-trainer/
├── docs/
│   ├── v3-spec.md              # Next iteration's feature spec
│   └── strategy-reference.md   # Underlying research doc (math, systems, bankroll)
├── src/
│   ├── main.jsx                # React entry
│   ├── App.jsx                 # App shell
│   └── CrapsTrainer.jsx        # Everything (~1850 lines, single file)
├── index.html
├── package.json
└── vite.config.js
```

The trainer is currently one big file. It's organized into clearly-marked sections (sound engine → constants → state → engine → UI components → desktop layout → mobile layout) but is intentionally unrefactored for now.

## What's next

The `docs/v3-spec.md` file is the agreed-upon next iteration. Highlights:

**P0 — ship first:**

1. Buy bet vig policy toggle (vig-on-win drops Buy 4/10 to 1.67% — promotes it to a smart bet)
2. Field 2× / 3× on 12 toggle (cruise ship games are usually 2×)
3. 20× table-minimum buy-in rule with undercapitalization warning
4. Coverage cost line on the Veteran strategy card
5. New "Smart Fun" 4th strategy — coverage that doesn't pay the outside-numbers tax

**P1 — strategy intelligence:**

6. Per-roll edge alongside per-resolution on every bet badge
7. Iron Cross detection — coach calls it out if you build it manually
8. PSO counter with reframed walk-warning (tilt prevention, not gambler's fallacy)
9. Strategy + buy-in compatibility check at strategy selection

**P2 — polish:**

10. ATS pay table toggle (good vs. reduced)
11. "Survivable seven-outs" stat (replacing exposure %)
12. Casino-vs-actual rated-edge tracker

See `docs/v3-spec.md` for the full spec and `docs/strategy-reference.md` for the research that drove the choices.

## Refactoring notes

When the time comes (after v3 ships):

- **Split `CrapsTrainer.jsx`** into: `betLogic.js`, `strategies.js`, `coachEngine.js`, and a `components/` folder for `Die`, `Badge`, `BetButton`, `TableView`, `BetPanel`, `CoachPanel`, `ExposureMap`, `StrategyGuide`, `SessionScorecard`
- The current file uses inline styles throughout. A Tailwind refactor is plausible but not urgent — it would touch nearly every line
- The instinct coach is rules-based and lives in `getLocalInstinct(snap)`. Deterministic, no API calls. Adding new advice patterns means adding new branches there

## Design principles

These are baked into the trainer and shouldn't drift without conscious decision:

1. **Math-first, but not math-only.** The house has an edge. The point is to take *smart* risk, not no risk.
2. **Honest cost surfacing.** When a strategy costs EV (e.g., coverage), say so out loud. Don't hide trades.
3. **No moralizing.** No lectures about gambling. The user is an adult with a budget.
4. **Short, punchy advice at the table.** The coach gets one sentence, not a paragraph.
5. **Local only.** Nothing leaves the browser. No telemetry, no save state, no accounts.

## License

Personal project. Not for distribution.
