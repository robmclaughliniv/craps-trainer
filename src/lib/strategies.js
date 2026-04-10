import { getMaxOddsAmt } from "./betLogic.js";

export const STRATS = [
  { id: "conservative", label: "Conservative", short: "Pass + Odds", color: "#4caf50" },
  { id: "veteran", label: "Veteran", short: "Pass + 6/8", color: "#2196f3" },
  { id: "molly", label: "3-Pt Molly", short: "Pass + 2 Comes", color: "#ff9800" },
];

export function isOnStrategy(strategyId, betKey) {
  if (!strategyId) return true;
  if (strategyId === "conservative") return ["pass", "passOdds", "dontPass", "dontPassOdds"].includes(betKey);
  if (strategyId === "veteran") return ["pass", "passOdds", "dontPass", "dontPassOdds", "place6", "place8"].includes(betKey);
  if (strategyId === "molly") return ["pass", "passOdds", "dontPass", "dontPassOdds", "come", "comeOdds"].includes(betKey);
  return true;
}

/**
 * @param {string|null} strategyId
 * @param {{ bets: object, phase: string, point: number|null, betUnit: number, comePoints: object[], maxOdds: string }} gameState
 */
export function getStrategySteps(strategyId, gameState) {
  if (!strategyId) return null;
  const { bets, phase, point, betUnit, comePoints, maxOdds } = gameState;
  const hasPass = bets.pass > 0;
  const passOddsMax = point ? getMaxOddsAmt(maxOdds, bets.pass, point) : 0;
  const passOddsDone = point && bets.passOdds >= passOddsMax && passOddsMax > 0;
  const isComeout = phase === "comeout";
  const has6 = bets.place6 > 0;
  const has8 = bets.place8 > 0;
  const numComePoints = comePoints.length;
  const hasPendingCome = bets.come > 0;
  const comeOddsAllMaxed = comePoints.every((cp) => cp.odds >= getMaxOddsAmt(maxOdds, cp.amount, cp.number));

  if (strategyId === "conservative") {
    const steps = [];
    if (isComeout) {
      steps.push({ done: hasPass, active: !hasPass, text: `Place Pass Line ($${betUnit})` });
      steps.push({ done: false, active: false, text: "Wait for point to be set" });
      steps.push({ done: false, active: false, text: "Max your odds behind the Pass" });
      steps.push({ done: false, active: false, text: "Stop. Watch. Collect or reset." });
    } else {
      steps.push({ done: hasPass, active: false, text: `Pass Line on ${point}` });
      steps.push({ done: passOddsDone, active: !passOddsDone && hasPass, text: `Max odds behind Pass (${bets.passOdds}/${passOddsMax})` });
      steps.push({ done: passOddsDone, active: false, text: "Stop. Watch. Collect or reset." });
    }
    return steps;
  }

  if (strategyId === "veteran") {
    const pointIs6or8 = point === 6 || point === 8;
    const need6 = !isComeout && point !== 6;
    const need8 = !isComeout && point !== 8;
    const steps = [];
    if (isComeout) {
      steps.push({ done: hasPass, active: !hasPass, text: `Place Pass Line ($${betUnit})` });
      steps.push({ done: false, active: false, text: "Wait for point to be set" });
      steps.push({ done: false, active: false, text: "Max your odds" });
      steps.push({ done: false, active: false, text: "Place 6 & 8 (if not the point)" });
      steps.push({ done: false, active: false, text: "Stop. Collect or reset." });
    } else {
      steps.push({ done: hasPass, active: false, text: `Pass Line on ${point}` });
      steps.push({ done: passOddsDone, active: !passOddsDone && hasPass, text: `Max odds (${bets.passOdds}/${passOddsMax})` });
      if (need6) steps.push({ done: has6, active: !has6 && passOddsDone, text: "Place 6" });
      if (need8) steps.push({ done: has8, active: !has8 && (passOddsDone || (need6 && has6)), text: "Place 8" });
      if (pointIs6or8) steps.push({ done: true, active: false, text: `Point IS ${point} — no place needed` });
      const allDone = passOddsDone && (!need6 || has6) && (!need8 || has8);
      steps.push({ done: allDone, active: false, text: "Stop. Collect or reset." });
    }
    return steps;
  }

  if (strategyId === "molly") {
    const steps = [];
    if (isComeout) {
      steps.push({ done: hasPass, active: !hasPass, text: `Place Pass Line ($${betUnit})` });
      steps.push({ done: false, active: false, text: "Wait for point to be set" });
      steps.push({ done: false, active: false, text: "Max odds → Come bet → repeat to 3 points" });
    } else {
      steps.push({ done: hasPass, active: false, text: `Pass on ${point}` });
      steps.push({ done: passOddsDone, active: !passOddsDone && hasPass, text: `Max Pass odds (${bets.passOdds}/${passOddsMax})` });
      for (let i = 0; i < comePoints.length; i++) {
        const cp = comePoints[i];
        const cpMax = getMaxOddsAmt(maxOdds, cp.amount, cp.number);
        const cpDone = cp.odds >= cpMax;
        steps.push({ done: true, active: false, text: `Come on ${cp.number} ($${cp.amount})` });
        steps.push({ done: cpDone, active: !cpDone, text: `Max odds on Come ${cp.number} (${cp.odds}/${cpMax})` });
      }
      if (hasPendingCome) steps.push({ done: false, active: true, text: "Come bet pending — waiting for roll" });
      const needMore = numComePoints < 2;
      if (needMore && !hasPendingCome) {
        steps.push({ done: false, active: comeOddsAllMaxed || numComePoints === 0, text: `Place Come bet #${numComePoints + 1}` });
      }
      const atTarget = numComePoints >= 2 && comeOddsAllMaxed;
      steps.push({ done: atTarget, active: false, text: "3 numbers working. Stop. Collect or reset." });
    }
    return steps;
  }

  return null;
}
