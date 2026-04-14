export const HOUSE_EDGES = {
  pass: 1.41, dontPass: 1.36, come: 1.41, dontCome: 1.36,
  odds: 0, place6: 1.52, place8: 1.52, place5: 4.0, place9: 4.0,
  place4: 6.67, place10: 6.67, field: 5.56, hardway6: 9.09,
  hardway8: 9.09, hardway4: 11.11, hardway10: 11.11,
  any7: 16.67, anyCraps: 11.11, yo: 11.11, boxcars: 13.89, aces: 13.89,
  buy4: 4.76, buy10: 4.76, horn: 12.5, ce: 11.11,
  allSmall: 7.76, allTall: 7.76, allNumbers: 7.76,
};

export const ratingColor = (he) => he === 0 ? "#00e676" : he <= 1.5 ? "#4caf50" : he <= 2 ? "#8bc34a" : he <= 5 ? "#ffc107" : he <= 10 ? "#ff9800" : "#f44336";
export const ratingLabel = (he) => he === 0 ? "FREE" : he <= 1.5 ? "SMART" : he <= 2 ? "GOOD" : he <= 5 ? "MEH" : he <= 10 ? "BAD" : "TRASH";

export const ODDS_PAY = { 4: [2, 1], 10: [2, 1], 5: [3, 2], 9: [3, 2], 6: [6, 5], 8: [6, 5] };
export const PLACE_PAY = { 4: [9, 5], 10: [9, 5], 5: [7, 5], 9: [7, 5], 6: [7, 6], 8: [7, 6] };
export const BUY_PAY = { 4: [2, 1], 10: [2, 1] };

export const ROLL_PROB = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };

export function getMaxOddsAmt(maxOdds, flatBet, ptNum) {
  if (maxOdds === "1x") return flatBet;
  if (maxOdds === "2x") return flatBet * 2;
  if (maxOdds === "5x") return flatBet * 5;
  if (maxOdds === "10x") return flatBet * 10;
  if (ptNum === 4 || ptNum === 10) return flatBet * 3;
  if (ptNum === 5 || ptNum === 9) return flatBet * 4;
  return flatBet * 5;
}

export function getBetIncrement(key, betUnit) {
  if (key === "place6" || key === "place8") return 6;
  if (key === "horn") return 4;
  return betUnit;
}

export function getBuyHE(num, vigPolicy) {
  if ((num === 4 || num === 10) && vigPolicy === "on-win") return 1.67;
  return 4.76;
}

export function getFieldHE(payOn12) {
  return payOn12 === 2 ? 5.56 : 2.78;
}

export const HOUSE_EDGES_PER_ROLL = {
  pass: 0.42, dontPass: 0.40, come: 0.42, dontCome: 0.40, odds: 0,
  place6: 0.46, place8: 0.46, place5: 1.11, place9: 1.11, place4: 1.67, place10: 1.67,
  field: 5.56,
  hardway6: 2.78, hardway8: 2.78, hardway4: 2.78, hardway10: 2.78,
  any7: 16.67, anyCraps: 11.11, yo: 11.11, boxcars: 13.89, aces: 13.89,
  buy4: 0.42, buy10: 0.42, horn: 12.5, ce: 11.11,
  allSmall: 7.76, allTall: 7.76, allNumbers: 7.76,
};

export const SMART_BETS = new Set(["pass", "dontPass", "come", "dontCome", "passOdds", "dontPassOdds", "place6", "place8"]);
export const OK_BETS = new Set(["field", "place5", "place9", "buy4", "buy10"]);

export function classifyBet(key, opts) {
  if (SMART_BETS.has(key) || key.includes("Odds")) return "smart";
  if (key === "buy4" || key === "buy10") {
    return opts?.buyVigPolicy === "on-win" ? "smart" : "ok";
  }
  if (key === "field") {
    return opts?.fieldPayOn12 === 2 ? "trash" : "ok";
  }
  return OK_BETS.has(key) ? "ok" : "trash";
}

export function initialBets() {
  return {
    pass: 0, dontPass: 0, come: 0, dontCome: 0,
    passOdds: 0, dontPassOdds: 0, comeOdds: 0, dontComeOdds: 0,
    place4: 0, place5: 0, place6: 0, place8: 0, place9: 0, place10: 0,
    buy4: 0, buy10: 0,
    field: 0, hardway4: 0, hardway6: 0, hardway8: 0, hardway10: 0,
    any7: 0, anyCraps: 0, yo: 0, boxcars: 0, aces: 0,
    horn: 0, ce: 0,
  };
}

/** Net P/L for ExposureMap preview for a hypothetical dice total (same logic as inline calcOutcome in coordinator). */
export function calcOutcome({ phase, point, bets, comePoints, dontComePoints, fieldPayOn12 = 3 }, total) {
  let net = 0;
  const isPointPhase = phase === "point";

  if (bets.field > 0) {
    if (total === 2) net += bets.field * 2;
    else if (total === 12) net += bets.field * fieldPayOn12;
    else if ([3, 4, 9, 10, 11].includes(total)) net += bets.field;
    else net -= bets.field;
  }
  if (bets.any7 > 0) { net += total === 7 ? bets.any7 * 4 : -bets.any7; }
  if (bets.anyCraps > 0) { net += [2, 3, 12].includes(total) ? bets.anyCraps * 7 : -bets.anyCraps; }
  if (bets.yo > 0) { net += total === 11 ? bets.yo * 15 : -bets.yo; }
  if (bets.boxcars > 0) { net += total === 12 ? bets.boxcars * 30 : -bets.boxcars; }
  if (bets.aces > 0) { net += total === 2 ? bets.aces * 30 : -bets.aces; }

  Object.entries({ hardway4: 4, hardway6: 6, hardway8: 8, hardway10: 10 }).forEach(([k, num]) => {
    if (bets[k] > 0) {
      if (total === 7 || total === num) net -= bets[k];
    }
  });

  if (isPointPhase) {
    [4, 5, 6, 8, 9, 10].forEach((num) => {
      const k = `place${num}`;
      if (bets[k] > 0) {
        if (total === num) { const [n, d] = PLACE_PAY[num]; net += Math.floor(bets[k] * n / d); }
        else if (total === 7) net -= bets[k];
      }
    });
  }

  if (isPointPhase) {
    if (bets.pass > 0) { if (total === point) net += bets.pass; else if (total === 7) net -= bets.pass; }
    if (bets.passOdds > 0) {
      if (total === point) { const [n, d] = ODDS_PAY[point]; net += Math.floor(bets.passOdds * n / d); }
      else if (total === 7) net -= bets.passOdds;
    }
    if (bets.dontPass > 0) { if (total === 7) net += bets.dontPass; else if (total === point) net -= bets.dontPass; }
    if (bets.dontPassOdds > 0) {
      if (total === 7) { const [n, d] = ODDS_PAY[point]; net += Math.floor(bets.dontPassOdds * d / n); }
      else if (total === point) net -= bets.dontPassOdds;
    }
  } else {
    if (bets.pass > 0) { if (total === 7 || total === 11) net += bets.pass; else if ([2, 3, 12].includes(total)) net -= bets.pass; }
    if (bets.dontPass > 0) { if ([2, 3].includes(total)) net += bets.dontPass; else if (total === 7 || total === 11) net -= bets.dontPass; }
  }

  if (isPointPhase) {
    comePoints.forEach((cp) => {
      if (total === cp.number) { net += cp.amount + (cp.odds > 0 ? Math.floor(cp.odds * (ODDS_PAY[cp.number][0] / ODDS_PAY[cp.number][1])) : 0); }
      else if (total === 7) net -= cp.amount + cp.odds;
    });
    dontComePoints.forEach((dp) => {
      if (total === 7) { net += dp.amount + (dp.odds > 0 ? Math.floor(dp.odds * (ODDS_PAY[dp.number][1] / ODDS_PAY[dp.number][0])) : 0); }
      else if (total === dp.number) net -= dp.amount + dp.odds;
    });
  }
  if (isPointPhase && bets.come > 0) { if (total === 7 || total === 11) net += bets.come; else if ([2, 3, 12].includes(total)) net -= bets.come; }
  if (isPointPhase && bets.dontCome > 0) { if ([2, 3].includes(total)) net += bets.dontCome; else if (total === 7 || total === 11) net -= bets.dontCome; }

  return net;
}
