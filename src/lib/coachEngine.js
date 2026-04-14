export const STICKMAN_CALLS = {
  2: "Two, craps, aces!",
  3: "Three, craps!",
  4: "Four, easy four",
  5: "Five, no field five",
  6: "Six, easy six",
  7: "Seven!",
  8: "Eight, easy eight",
  9: "Nine, center field!",
  10: "Ten, easy ten",
  11: "Yo, eleven!",
  12: "Twelve, boxcars!",
};
export const STICKMAN_HARD = { 4: "Four, the hard way!", 6: "Six, hard six!", 8: "Eight, hard eight!", 10: "Ten, hard ten!" };
export const STICKMAN_COMEOUT_7 = "Seven, winner!";
export const STICKMAN_POINT_7 = "Seven out, line away!";
export const STICKMAN_POINT_HIT = "Winner! Point is made!";

export function getLocalInstinct(snap) {
  const p = snap.phase;
  const pt = snap.point;
  const b = snap.bets;
  const br = snap.bankroll;
  const sb = snap.startingBankroll;
  const cp = snap.comePoints || [];
  const risk = snap.totalAtRisk;
  const pnlPct = sb > 0 ? Math.round(((br - sb) / sb) * 100) : 0;
  const riskPct = br > 0 ? Math.round((risk / br) * 100) : 0;
  const hasPass = b.pass > 0;
  const hasOdds = b.passOdds > 0;
  const hasBadBets = b.any7 > 0 || b.anyCraps > 0 || b.yo > 0 || b.boxcars > 0 || b.aces > 0;
  const hasHardways = b.hardway4 > 0 || b.hardway6 > 0 || b.hardway8 > 0 || b.hardway10 > 0;
  const hasField = b.field > 0;
  const lastTotal = snap.lastRoll ? snap.lastRoll.total : 0;
  const wasSevenOut = snap.lastResult && snap.lastResult.includes("SEVEN OUT");
  const wasPoint = snap.lastResult && snap.lastResult.includes("Point set");
  const wasPointHit = snap.lastResult && snap.lastResult.includes("HIT THE POINT");

  if (br < sb * 0.3)
    return { instinct: "When your bankroll drops below 30% of your buy-in, the session is over. Walk.", why: "You can't properly size bets or take odds. Every roll digs the hole deeper.", action: "Stop playing. End the session now.", risk: "overexposed", risk_note: "At " + Math.round(br/sb*100) + "% of buy-in — critical.", warnings: "Stop-loss territory. Walk away." };
  if (br < sb * 0.5)
    return { instinct: "When you're below half your buy-in, stop adding bets. Play what's on the table and let it resolve.", why: "Below 50% means you can't survive many more seven-outs. Preservation mode.", action: "No new bets. Let existing positions play out.", risk: "high", risk_note: "At " + Math.round(br/sb*100) + "% of buy-in.", warnings: "Tightening up is the smart play here." };

  const psos = snap.consecutivePSOs || 0;
  if (psos >= 5)
    return { instinct: "Five seven-outs in a row is what variance looks like — but your bankroll has taken real damage. Check your numbers before the next bet.", why: "Dice have no memory. The next shooter's odds are identical. The problem isn't the table — it's how much of your bankroll has been consumed.", action: "Stop. Add up what you've actually lost and decide whether to stay.", risk: "high", risk_note: psos + " PSOs in a row.", warnings: "This is your stop-loss decision point." };
  if (psos >= 3)
    return { instinct: "Three seven-outs in a row. Reminder: dice have no memory — the next shooter isn't 'due.' But three losses in a row often means you're tilting.", why: "Tilt is the real risk after consecutive losses. Your stop-loss is closer than it feels.", action: "Take a breath. Worth a short break before the next bet?", risk: "medium", risk_note: "3 PSOs — tilt risk, not pattern risk.", warnings: null };

  if (hasBadBets)
    return { instinct: "When you put money in the center of the table, you're paying 11-17% edge. That's not strategy, it's a donation.", why: "Any 7 is 16.67% edge. Props look exciting but the math is brutal.", action: "Remove prop bets. Move that money to odds instead.", risk: "high", risk_note: "Prop bets are dragging your efficiency down.", warnings: "Center bets are the casino's rent money." };
  if (hasHardways)
    return { instinct: "When you bet Hardways, you need one exact combination to win vs many ways to lose.", why: "Hard 6: 1 way to win, 10 ways to lose (5 easy + 6 sevens). That's 9.09% edge.", action: "Hardways are fun money only. Never a core bet.", risk: "high", risk_note: "Hardway edge is 9-11%.", warnings: null };

  const isIronCross = b.field > 0 && b.place5 > 0 && b.place6 > 0 && b.place8 > 0;
  if (isIronCross && !snap.activeStrategy)
    return { instinct: "When you build an Iron Cross, you're getting an 83% hit rate but paying 6-10× more than Pass+Odds.", why: "You win on every number except 7 — it feels great. But the 7 wipes everything, and over time the blended edge is brutal.", action: "It's a legit fun choice if you know what you're paying. Just don't mistake it for strategy.", risk: "medium", risk_note: "Iron Cross detected — entertainment density at the cost of EV.", warnings: null };

  if (riskPct > 25)
    return { instinct: "When more than 20% of your bankroll is at risk on one seven-out, you're overexposed.", why: riskPct + "% of your bankroll disappears if a 7 rolls right now.", action: "Stop adding bets. Consider taking down Place bets.", risk: "high", risk_note: "$" + risk + " at risk out of $" + br + " bankroll.", warnings: "One bad roll and you're in danger zone." };

  if (pnlPct >= 50)
    return { instinct: "When you're up 50%+, seriously consider walking. Variance will regress — the question is when.", why: "Hot streaks feel like skill. They're not. You're up $" + (br - sb) + " — protect it.", action: "Consider ending the session. Lock the win.", risk: "medium", risk_note: "Up " + pnlPct + "% on your buy-in.", warnings: null };
  if (pnlPct >= 30)
    return { instinct: "When you're up 30%+, mentally lock in your original buy-in. You're playing with profit now.", why: "The biggest leak in craps is giving back wins. Set a floor and walk if you hit it.", action: "Keep playing but protect your original $" + sb + ".", risk: "low", risk_note: "Healthy profit position.", warnings: null };

  if (p === "comeout") {
    if (wasSevenOut)
      return { instinct: "When you seven out, take a breath before your next bet. The urge to chase starts right here.", why: "Seven-outs feel personal. They're not. Next shooter's odds are identical.", action: "Same Pass bet, same size. Fresh start.", risk: "low", risk_note: "New come-out roll.", warnings: lastTotal === 7 ? "Don't increase your bet to 'make it back'." : null };
    if (wasPointHit)
      return { instinct: "When you hit the point, collect and reload the exact same way. Don't let a win change your sizing.", why: "Hitting the point is one resolved bet. Next come-out is independent.", action: "Same Pass bet. Rebuild your position the same way.", risk: "low", risk_note: "Fresh come-out.", warnings: null };
    if (!hasPass)
      return { instinct: "When it's come-out and you have no Pass bet, that's your first and only move.", why: "Pass line at 1.41% edge is your foundation. Build from here.", action: "Place a $" + snap.betUnit + " Pass Line bet.", risk: "low", risk_note: "No bets on the table.", warnings: null };
    return { instinct: "When your Pass bet is down on come-out, keep your hands off. Let the dice set the point.", why: "Come-out resolves on 7/11 (win) or 2/3/12 (lose). No other bets matter yet.", action: "Wait for the point.", risk: "low", risk_note: "Pass bet working.", warnings: null };
  }

  if (hasPass && !hasOdds)
    return { instinct: "When the point is set and your Pass has no odds behind it, that's ALWAYS your first move.", why: "Odds pay true — 0% house edge. The only free bet in the casino.", action: "Max your odds on the Pass Line now.", risk: "low", risk_note: "Missing free money on odds.", warnings: null };
  if (hasPass && hasOdds && b.passOdds < snap.betUnit * 3 && pt)
    return { instinct: "When your odds aren't maxed, every dollar moved to odds improves your position.", why: "Odds at 0% vs anything else at 1.4%+. Always max odds first.", action: "Add more odds before making any other bet.", risk: "low", risk_note: "Odds can go higher.", warnings: null };

  if (pt === 6 || pt === 8) {
    if (cp.length === 0 && b.come === 0)
      return { instinct: "When point is " + pt + " with odds maxed, you're in the best spot on the board. Consider spreading to more numbers.", why: pt + " has 5 ways to roll vs 6 for the 7 — 45.5% chance before seven-out.", action: "Place the other " + (pt === 6 ? "8" : "6") + " or add a Come bet.", risk: "low", risk_note: "Strong position on " + pt + ".", warnings: null };
    return { instinct: "When point is " + pt + " and you have numbers working, hold steady and let them hit.", why: "You're on the best point with action spread. Patience wins here.", action: "Hold. Collect when your numbers hit.", risk: "low", risk_note: "Well positioned.", warnings: null };
  }
  if (pt === 5 || pt === 9) {
    if (!b.place6 && !b.place8)
      return { instinct: "When point is " + pt + ", Place 6 and 8 give you the best side action at 1.52% edge.", why: pt + " has 4 ways to roll vs 6 for the 7. Placing 6/8 adds 5-way numbers.", action: "Place 6 and/or 8 for extra numbers working.", risk: "medium", risk_note: "Point " + pt + " is a 40% shot.", warnings: null };
    return { instinct: "When point is " + pt + " with numbers working, you're properly spread. Don't overdo it.", why: "4 ways to make " + pt + " vs 6 for the 7. Your side bets catch the non-point rolls.", action: "Hold your position. Collect or reset.", risk: "medium", risk_note: "Solid but watch exposure.", warnings: null };
  }
  if (pt === 4 || pt === 10) {
    return { instinct: "When point is " + pt + ", respect that you're a 2-to-1 underdog. Don't stack more bets.", why: "Only 3 ways to roll " + pt + " vs 6 for the 7. Odds pay 2:1 to compensate.", action: "Odds maxed is enough. Place 6/8 if you want action, nothing more.", risk: "medium", risk_note: "Tough point — 33% chance.", warnings: null };
  }

  if (cp.length > 0) {
    var unmaxedCome = cp.find(function(c) { return c.odds === 0; });
    if (unmaxedCome)
      return { instinct: "When a Come bet travels to a number, get odds on it immediately — that's the whole point.", why: "Come without odds is leaving the best part of the bet on the table.", action: "Add odds to your Come on " + unmaxedCome.number + " in Active Bets.", risk: "low", risk_note: "Come point needs odds.", warnings: null };
    if (cp.length >= 3)
      return { instinct: "When you have 3+ come points working, stop adding. You're well-spread but a 7 hurts more.", why: "Every come point dies on a seven-out. More numbers = bigger seven-out pain.", action: "Hold. Let your numbers hit or reset on a 7.", risk: "medium", risk_note: cp.length + " come points active.", warnings: null };
  }

  if (hasField)
    return { instinct: "When you bet the Field, it's a one-roll coin flip with a 5.56% tax. Fun, not strategy.", why: "16 ways to win vs 20 to lose. The 2x/3x on 2 and 12 don't fully compensate.", action: "Okay occasionally, but not every roll.", risk: "medium", risk_note: "Field is a one-roll bet.", warnings: null };

  return { instinct: "When in doubt, stick to the basics: Pass + max odds. Everything else is optional.", why: "Pass + odds gives you a combined edge well under 1%. That's the best deal in the casino.", action: "Make sure your odds are maxed before adding any other bet.", risk: "low", risk_note: "Steady play.", warnings: null };
}
