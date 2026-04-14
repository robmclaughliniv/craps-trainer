import { ODDS_PAY, PLACE_PAY } from "./betLogic.js";
import { STICKMAN_CALLS, STICKMAN_HARD, STICKMAN_COMEOUT_7, STICKMAN_POINT_7, STICKMAN_POINT_HIT } from "./coachEngine.js";
import { playWinSound, playLoseSound, playPointSetSound, playBigWinSound, speakCall } from "./sounds.js";
import { SHOOTERS } from "./shooters.js";

/**
 * Runs the post-roll resolution (former setTimeout body inside rollDice). No React imports — caller passes setters/refs.
 */
export function completeCrapsRoll(ctx) {
  const {
    d1,
    d2,
    total,
    isHard,
    phase,
    point,
    bets,
    comePoints,
    dontComePoints,
    allSmallBet,
    allTallBet,
    allNumbersBet,
    allSmallHits,
    allTallHits,
    allNumbersHits,
    win,
    lose,
    push,
    setDie1,
    setDie2,
    lastRollRef,
    setRolling,
    setRollCount,
    setPoint,
    setPhase,
    setComePoints,
    setDontComePoints,
    setBets,
    setBankroll,
    setSessionWins,
    setSessionLosses,
    setLastRollNet,
    setAutoRolling,
    setShooterPaused,
    setAllSmallBet,
    setAllSmallHits,
    setAllTallBet,
    setAllTallHits,
    setAllNumbersBet,
    setAllNumbersHits,
    addLog,
    currentShooter,
    nextShooter,
    rotationEnabled,
    setCurrentShooterIdx,
    isBotShooter,
    autoRollTimerRef,
    soundEnabled,
    fieldPayOn12 = 3,
    setConsecutivePSOs,
  } = ctx;

  setDie1(d1); setDie2(d2); lastRollRef.current = { d1, d2, total };
  setRolling(false); setRollCount((p) => p + 1);
  var phaseBeforeRoll = phase;
  let results = [];
  if (bets.field > 0) { if (total === 2) { const w = win("field", bets.field * 2); results.push(`Field WIN +$${w}`); } else if (total === 12) { const w = win("field", bets.field * fieldPayOn12); results.push(`Field WIN +$${w}`); } else if ([3,4,9,10,11].includes(total)) { const w = win("field", bets.field); results.push(`Field WIN +$${w}`); } else { const l = lose("field"); results.push(`Field LOSE -$${l}`); } }
  if (bets.any7 > 0) { if (total === 7) { const w = win("any7", bets.any7 * 4); results.push(`Any 7 WIN +$${w}`); } else { const l = lose("any7"); results.push(`Any 7 LOSE -$${l}`); } }
  if (bets.anyCraps > 0) { if ([2,3,12].includes(total)) { const w = win("anyCraps", bets.anyCraps * 7); results.push(`Any Craps WIN +$${w}`); } else { const l = lose("anyCraps"); results.push(`Any Craps LOSE -$${l}`); } }
  if (bets.yo > 0) { if (total === 11) { const w = win("yo", bets.yo * 15); results.push(`Yo WIN +$${w}`); } else { const l = lose("yo"); results.push(`Yo LOSE -$${l}`); } }
  if (bets.boxcars > 0) { if (total === 12) { const w = win("boxcars", bets.boxcars * 30); results.push(`Boxcars WIN +$${w}`); } else { const l = lose("boxcars"); results.push(`Boxcars LOSE -$${l}`); } }
  if (bets.aces > 0) { if (total === 2) { const w = win("aces", bets.aces * 30); results.push(`Aces WIN +$${w}`); } else { const l = lose("aces"); results.push(`Aces LOSE -$${l}`); } }
  Object.entries({ hardway4: 4, hardway6: 6, hardway8: 8, hardway10: 10 }).forEach(([key, num]) => {
    if (bets[key] > 0) { if (total === num && isHard) { const w = win(key, bets[key] * ((num === 4 || num === 10) ? 7 : 9)); results.push(`Hard ${num} WIN +$${w}`); } else if (total === 7 || (total === num && !isHard)) { const l = lose(key); results.push(`Hard ${num} LOSE -$${l}`); } }
  });
  [4,5,6,8,9,10].forEach((num) => { const key = `place${num}`; if (bets[key] > 0 && phase === "point") { if (total === num) { const [n,d] = PLACE_PAY[num]; const payout = Math.floor(bets[key]*n/d); setBankroll((p)=>p+payout); setSessionWins((p)=>p+payout); results.push(`Place ${num} WIN +$${payout} (stays up)`); } else if (total === 7) { const l = lose(key); results.push(`Place ${num} LOSE -$${l}`); } } });
  [4,10].forEach(function(num) { var key = "buy" + num; if (bets[key] > 0 && phase === "point") { if (total === num) { var payout = Math.floor(bets[key] * 2 * 0.95); setBankroll(function(p){return p+payout}); setSessionWins(function(p){return p+payout}); results.push("Buy " + num + " WIN +$" + payout + " (stays up)"); } else if (total === 7) { var l = lose(key); results.push("Buy " + num + " LOSE -$" + l); } } });
  if (bets.horn > 0) { var hu = bets.horn / 4; if ([2,12].includes(total)) { var hw = win("horn", Math.floor(hu * 27)); results.push("Horn WIN +$" + hw); } else if ([3,11].includes(total)) { var hw2 = win("horn", Math.floor(hu * 3)); results.push("Horn WIN +$" + hw2); } else { var hl = lose("horn"); results.push("Horn LOSE -$" + hl); } }
  if (bets.ce > 0) { if ([2,3,12].includes(total)) { var cw = win("ce", bets.ce * 3); results.push("C&E WIN +$" + cw); } else if (total === 11) { var cw2 = win("ce", bets.ce * 7); results.push("C&E WIN +$" + cw2); } else { var cl = lose("ce"); results.push("C&E LOSE -$" + cl); } }
  if (allSmallBet > 0 || allTallBet > 0 || allNumbersBet > 0) {
    if (total === 7) {
      if (allSmallBet > 0) { setSessionLosses(function(p){return p+allSmallBet}); results.push("All Small LOSE -$"+allSmallBet); setAllSmallBet(0); setAllSmallHits([]); }
      if (allTallBet > 0) { setSessionLosses(function(p){return p+allTallBet}); results.push("All Tall LOSE -$"+allTallBet); setAllTallBet(0); setAllTallHits([]); }
      if (allNumbersBet > 0) { setSessionLosses(function(p){return p+allNumbersBet}); results.push("All Numbers LOSE -$"+allNumbersBet); setAllNumbersBet(0); setAllNumbersHits([]); }
    } else {
      if (allSmallBet > 0 && [2,3,4,5,6].includes(total)) { var nsh = allSmallHits.indexOf(total)<0 ? allSmallHits.concat(total) : allSmallHits; setAllSmallHits(nsh); if(nsh.length>=5){var swn=allSmallBet*34;setBankroll(function(p){return p+allSmallBet+swn});setSessionWins(function(p){return p+swn});results.push("ALL SMALL HIT! +$"+swn);setAllSmallBet(0);setAllSmallHits([]);} }
      if (allTallBet > 0 && [8,9,10,11,12].includes(total)) { var nth = allTallHits.indexOf(total)<0 ? allTallHits.concat(total) : allTallHits; setAllTallHits(nth); if(nth.length>=5){var twn=allTallBet*34;setBankroll(function(p){return p+allTallBet+twn});setSessionWins(function(p){return p+twn});results.push("ALL TALL HIT! +$"+twn);setAllTallBet(0);setAllTallHits([]);} }
      if (allNumbersBet > 0 && total>=2 && total<=12 && total!==7) { var nnh = allNumbersHits.indexOf(total)<0 ? allNumbersHits.concat(total) : allNumbersHits; setAllNumbersHits(nnh); if(nnh.length>=10){var nwn=allNumbersBet*175;setBankroll(function(p){return p+allNumbersBet+nwn});setSessionWins(function(p){return p+nwn});results.push("ALL NUMBERS HIT! +$"+nwn);setAllNumbersBet(0);setAllNumbersHits([]);} }
    }
  }
  if (phase === "point") {
    const newCP = []; comePoints.forEach((cp) => { if (total === cp.number) { const w = cp.amount + cp.odds*(ODDS_PAY[cp.number][0]/ODDS_PAY[cp.number][1]); setBankroll((p)=>p+cp.amount+Math.floor(w)); setSessionWins((p)=>p+Math.floor(w)); results.push(`Come ${cp.number} WIN +$${Math.floor(w)}`); } else if (total === 7) { setSessionLosses((p)=>p+cp.amount+cp.odds); results.push(`Come ${cp.number} LOSE -$${cp.amount+cp.odds}`); } else { newCP.push(cp); } });
    if (bets.come > 0) { if (total === 7 || total === 11) { const w = win("come", bets.come); results.push(`Come WIN +$${w}`); } else if ([2,3,12].includes(total)) { const l = lose("come"); results.push(`Come LOSE -$${l}`); } else { newCP.push({number:total,amount:bets.come,odds:0}); setBets((p)=>({...p,come:0,comeOdds:0})); results.push(`Come → ${total}`); } }
    setComePoints(newCP);
    const newDCP = []; dontComePoints.forEach((dp) => { if (total === 7) { const w = dp.amount+dp.odds; setBankroll((p)=>p+w+dp.odds); setSessionWins((p)=>p+dp.amount+dp.odds); results.push(`DC ${dp.number} WIN +$${w}`); } else if (total === dp.number) { setSessionLosses((p)=>p+dp.amount+dp.odds); results.push(`DC ${dp.number} LOSE -$${dp.amount+dp.odds}`); } else { newDCP.push(dp); } });
    if (bets.dontCome > 0) { if ([2,3].includes(total)) { const w = win("dontCome",bets.dontCome); results.push(`DC WIN +$${w}`); } else if (total===12) { push("dontCome"); results.push("DC PUSH"); } else if ([7,11].includes(total)) { const l = lose("dontCome"); results.push(`DC LOSE -$${l}`); } else { newDCP.push({number:total,amount:bets.dontCome,odds:0}); setBets((p)=>({...p,dontCome:0,dontComeOdds:0})); results.push(`DC → ${total}`); } }
    setDontComePoints(newDCP);
  }
  if (phase === "comeout") {
    if (total === 7 || total === 11) { if (bets.pass > 0) { const w = win("pass",bets.pass); results.push(`Pass WIN +$${w}`); } if (bets.dontPass > 0) { const l = lose("dontPass"); results.push(`DP LOSE -$${l}`); } if (bets.passOdds > 0) push("passOdds"); if (bets.dontPassOdds > 0) push("dontPassOdds"); if (setConsecutivePSOs) setConsecutivePSOs(0); addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — ${total===7?"SEVEN":"YO!"} ${results.join(" | ")}`, results.some(r=>r.includes("WIN"))?"win":"lose"); }
    else if ([2,3,12].includes(total)) { if (bets.pass > 0) { const l = lose("pass"); results.push(`Pass LOSE -$${l}`); } if (bets.dontPass > 0) { if (total===12) { push("dontPass"); results.push("DP PUSH"); } else { const w = win("dontPass",bets.dontPass); results.push(`DP WIN +$${w}`); } } if (bets.passOdds > 0) push("passOdds"); if (bets.dontPassOdds > 0) push("dontPassOdds"); addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — CRAPS! ${results.join(" | ")}`, results.some(r=>r.includes("WIN"))?"win":"lose"); }
    else { setPoint(total); setPhase("point"); results.push(`Point: ${total}`); addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — Point set: ${total}. ${results.join(" | ")}`, "point"); }
  } else {
    if (total === point) {
      if (bets.pass > 0) { const w = win("pass",bets.pass); results.push(`Pass WIN +$${w}`); }
      if (bets.passOdds > 0) { const [n,d] = ODDS_PAY[point]; const w = win("passOdds",Math.floor(bets.passOdds*n/d)); results.push(`Odds WIN +$${w}`); }
      if (bets.dontPass > 0) { const l = lose("dontPass"); results.push(`DP LOSE -$${l}`); }
      if (bets.dontPassOdds > 0) { const l = lose("dontPassOdds"); results.push(`DPO LOSE -$${l}`); }
      if (setConsecutivePSOs) setConsecutivePSOs(0);
      setPoint(null); setPhase("comeout"); addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — HIT THE POINT! ${results.join(" | ")}`, "win");
    } else if (total === 7) {
      if (bets.pass > 0) { const l = lose("pass"); results.push(`Pass LOSE -$${l}`); }
      if (bets.passOdds > 0) { const l = lose("passOdds"); results.push(`Odds LOSE -$${l}`); }
      if (bets.dontPass > 0) { const w = win("dontPass",bets.dontPass); results.push(`DP WIN +$${w}`); }
      if (bets.dontPassOdds > 0) { const [n,d] = ODDS_PAY[point]; const w = win("dontPassOdds",Math.floor(bets.dontPassOdds*d/n)); results.push(`DPO WIN +$${w}`); }
      if (setConsecutivePSOs) setConsecutivePSOs(p => p + 1);
      setComePoints([]); setDontComePoints([]); setPoint(null); setPhase("comeout");
      if (rotationEnabled) {
        setCurrentShooterIdx((prev) => (prev + 1) % SHOOTERS.length);
        setAutoRolling(false); setShooterPaused(true);
      }
      addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — SEVEN OUT!${rotationEnabled?` Dice pass to ${nextShooter.name}.`:""} ${results.join(" | ")}`, results.some(r=>r.includes("WIN"))&&!results.some(r=>r.includes("LOSE"))?"win":"lose");
    } else {
      addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — ${results.length > 0 ? results.join(" | ") : "No decision"}`, results.some(r=>r.includes("WIN"))?"win":results.some(r=>r.includes("LOSE"))?"lose":"info");
    }
  }
  let rollNet = 0;
  results.forEach(r => {
    const winMatch = r.match(/WIN \+\$(\d+)/);
    const loseMatch = r.match(/LOSE -\$(\d+)/);
    if (winMatch) rollNet += parseInt(winMatch[1]);
    if (loseMatch) rollNet -= parseInt(loseMatch[1]);
  });
  setLastRollNet(rollNet);

  const hadResolution = results.some(r => r.includes("WIN") || r.includes("LOSE"));
  if (isBotShooter && hadResolution) {
    setAutoRolling(false);
    setShooterPaused(true);
    if (autoRollTimerRef.current) clearTimeout(autoRollTimerRef.current);
  }

  if (soundEnabled) {
    var isComeout = phaseBeforeRoll === "comeout";
    var didSevenOut = !isComeout && total === 7;
    var didPointHit = !isComeout && total === point;
    var didSetPoint = isComeout && ![2,3,7,11,12].includes(total);
    var didComeoutWin = isComeout && (total === 7 || total === 11);
    var didCraps = isComeout && [2,3,12].includes(total);
    var hadWin = results.some(function(r){return r.includes("WIN")});
    var hadLose = results.some(function(r){return r.includes("LOSE")});
    var hadBigWin = rollNet >= 50;
    var hadAllHit = results.some(function(r){return r.includes("ALL SMALL") || r.includes("ALL TALL") || r.includes("ALL NUMBERS")});

    var call = "";
    if (didSevenOut) call = STICKMAN_POINT_7;
    else if (didPointHit) call = STICKMAN_POINT_HIT;
    else if (didComeoutWin && total === 7) call = STICKMAN_COMEOUT_7;
    else if (isHard && STICKMAN_HARD[total]) call = STICKMAN_HARD[total];
    else call = STICKMAN_CALLS[total] || ("" + total);

    if (didSetPoint) call += " Mark it, point is " + total;
    if (didCraps) call += " Craps!";
    if (didComeoutWin && total === 11) call = "Yo eleven, winner!";

    setTimeout(function() { speakCall(call); }, 100);

    if (hadAllHit || hadBigWin) setTimeout(playBigWinSound, 50);
    else if (didPointHit || (hadWin && !hadLose)) setTimeout(playWinSound, 50);
    else if (didSevenOut || (hadLose && !hadWin)) setTimeout(playLoseSound, 50);
    else if (didSetPoint) setTimeout(playPointSetSound, 50);
  }
}
