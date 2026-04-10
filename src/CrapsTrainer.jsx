import { useState, useCallback, useRef, useEffect } from "react";

// ═══════════════════ SOUND ENGINE ═══════════════════
const audioCtxRef = { current: null };
const getAudioCtx = () => {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
  return audioCtxRef.current;
};

const playTone = (freq, duration, type, vol) => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

const playDiceRoll = () => {
  try {
    const ctx = getAudioCtx();
    const bufSize = ctx.sampleRate * 0.35;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = 1 - (i / bufSize);
      data[i] = (Math.random() * 2 - 1) * env * env * 0.3;
    }
    const src = ctx.createBufferSource();
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = 2000;
    filt.Q.value = 0.5;
    src.buffer = buf;
    src.connect(filt);
    filt.connect(ctx.destination);
    src.start();
  } catch (e) {}
};

const playWinSound = () => {
  playTone(523, 0.12, "sine", 0.15);
  setTimeout(() => playTone(659, 0.12, "sine", 0.15), 80);
  setTimeout(() => playTone(784, 0.2, "sine", 0.12), 160);
};

const playLoseSound = () => {
  playTone(300, 0.2, "triangle", 0.12);
  setTimeout(() => playTone(220, 0.3, "triangle", 0.1), 150);
};

const playPointSetSound = () => {
  playTone(440, 0.08, "sine", 0.1);
  setTimeout(() => playTone(660, 0.15, "sine", 0.12), 100);
};

const playBigWinSound = () => {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, "sine", 0.15), i * 100);
  });
};

const STICKMAN_CALLS = {
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
const STICKMAN_HARD = { 4: "Four, the hard way!", 6: "Six, hard six!", 8: "Eight, hard eight!", 10: "Ten, hard ten!" };
const STICKMAN_COMEOUT_7 = "Seven, winner!";
const STICKMAN_POINT_7 = "Seven out, line away!";
const STICKMAN_POINT_HIT = "Winner! Point is made!";

const speakCall = (text) => {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.1;
    u.pitch = 0.9;
    u.volume = 0.8;
    window.speechSynthesis.speak(u);
  } catch (e) {}
};

const HOUSE_EDGES = {
  pass: 1.41, dontPass: 1.36, come: 1.41, dontCome: 1.36,
  odds: 0, place6: 1.52, place8: 1.52, place5: 4.0, place9: 4.0,
  place4: 6.67, place10: 6.67, field: 5.56, hardway6: 9.09,
  hardway8: 9.09, hardway4: 11.11, hardway10: 11.11,
  any7: 16.67, anyCraps: 11.11, yo: 11.11, boxcars: 13.89, aces: 13.89,
  buy4: 4.76, buy10: 4.76, horn: 12.5, ce: 11.11,
  allSmall: 7.76, allTall: 7.76, allNumbers: 7.76,
};

// ═══════════════════ SHOOTER ROTATION ═══════════════════
const SHOOTERS = [
  { id: "you", name: "You", isBot: false },
  { id: "mike", name: "Mike", isBot: true },
  { id: "sarah", name: "Sarah", isBot: true },
  { id: "tom", name: "Tom", isBot: true },
];

const ratingColor = (he) => he === 0 ? "#00e676" : he <= 1.5 ? "#4caf50" : he <= 2 ? "#8bc34a" : he <= 5 ? "#ffc107" : he <= 10 ? "#ff9800" : "#f44336";
const ratingLabel = (he) => he === 0 ? "FREE" : he <= 1.5 ? "SMART" : he <= 2 ? "GOOD" : he <= 5 ? "MEH" : he <= 10 ? "BAD" : "TRASH";

const ODDS_PAY = { 4: [2, 1], 10: [2, 1], 5: [3, 2], 9: [3, 2], 6: [6, 5], 8: [6, 5] };
const PLACE_PAY = { 4: [9, 5], 10: [9, 5], 5: [7, 5], 9: [7, 5], 6: [7, 6], 8: [7, 6] };
const BUY_PAY = { 4: [2, 1], 10: [2, 1] };

const DICE_DOTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 500);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

function Die({ value, rolling, delay = 0, color = "#fff", size = 72 }) {
  const dots = DICE_DOTS[value] || [];
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (rolling) { setShake(true); const t = setTimeout(() => setShake(false), 600 + delay * 1000); return () => clearTimeout(t); }
  }, [rolling, delay]);
  const dotSize = Math.round(size * 0.167);
  return (
    <div style={{
      width: size, height: size, background: color, borderRadius: Math.round(size * 0.167),
      display: "grid", placeItems: "center", position: "relative",
      boxShadow: shake
        ? "0 8px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)"
        : "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
      animation: shake ? `diceTumble 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) ${delay}s both` : "none",
      border: "1px solid rgba(255,255,255,0.15)",
      transition: "box-shadow 0.3s ease",
    }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute", width: dotSize, height: dotSize, borderRadius: "50%",
          background: "#1a1a2e", left: `${d[0]}%`, top: `${d[1]}%`,
          transform: "translate(-50%, -50%)",
          boxShadow: "inset 0 2px 3px rgba(0,0,0,0.3)",
        }} />
      ))}
    </div>
  );
}

function Badge({ he }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
      background: ratingColor(he) + "22", color: ratingColor(he),
      letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace",
    }}>
      {ratingLabel(he)} {he}%
    </span>
  );
}

function BetButton({ label, he, amount, onBet, onRemove, disabled, mini }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: mini ? "4px 0" : "6px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: mini ? 12 : 13, color: amount > 0 ? "#e0e0e0" : "#888",
          fontWeight: amount > 0 ? 600 : 400,
        }}>
          {label} {amount > 0 && <span style={{ color: ratingColor(he) }}>${amount}</span>}
        </div>
      </div>
      <Badge he={he} />
      <div style={{ display: "flex", gap: 3 }}>
        <button onClick={onBet} disabled={disabled} style={{
          padding: "3px 10px", fontSize: 11, borderRadius: 4,
          background: disabled ? "#333" : "rgba(76,175,80,0.2)", color: disabled ? "#555" : "#4caf50",
          border: `1px solid ${disabled ? "#444" : "rgba(76,175,80,0.3)"}`,
          cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600,
        }}>+</button>
        {amount > 0 && (
          <button onClick={onRemove} style={{
            padding: "3px 10px", fontSize: 11, borderRadius: 4,
            background: "rgba(244,67,54,0.15)", color: "#f44336",
            border: "1px solid rgba(244,67,54,0.3)", cursor: "pointer", fontWeight: 600,
          }}>−</button>
        )}
      </div>
    </div>
  );
}

const initialBets = () => ({
  pass: 0, dontPass: 0, come: 0, dontCome: 0,
  passOdds: 0, dontPassOdds: 0, comeOdds: 0, dontComeOdds: 0,
  place4: 0, place5: 0, place6: 0, place8: 0, place9: 0, place10: 0,
  buy4: 0, buy10: 0,
  field: 0, hardway4: 0, hardway6: 0, hardway8: 0, hardway10: 0,
  any7: 0, anyCraps: 0, yo: 0, boxcars: 0, aces: 0,
  horn: 0, ce: 0,
});

export default function CrapsTrainer() {
  const winWidth = useWindowWidth();
  const isDesktop = winWidth >= 860;

  const [bankroll, setBankroll] = useState(500);
  const [startingBankroll, setStartingBankroll] = useState(500);
  const [betUnit, setBetUnit] = useState(10);
  const [bets, setBets] = useState(initialBets());
  const [die1, setDie1] = useState(3);
  const [die2, setDie2] = useState(4);
  const [rolling, setRolling] = useState(false);
  const [point, setPoint] = useState(null);
  const [phase, setPhase] = useState("comeout");
  const [log, setLog] = useState([]);
  const [rollCount, setRollCount] = useState(0);
  const [sessionWins, setSessionWins] = useState(0);
  const [sessionLosses, setSessionLosses] = useState(0);
  const [showSetup, setShowSetup] = useState(true);
  const [comePoints, setComePoints] = useState([]);
  const [dontComePoints, setDontComePoints] = useState([]);
  const [tab, setTab] = useState("line");
  const [showStrategy, setShowStrategy] = useState(false);
  const [coachAdvice, setCoachAdvice] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachEnabled, setCoachEnabled] = useState(true);
  const [maxOdds, setMaxOdds] = useState("345x");
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [lastRollNet, setLastRollNet] = useState(null);
  const [mobileTab, setMobileTab] = useState("bets");
  const [showScorecard, setShowScorecard] = useState(false);
  const [allSmallBet, setAllSmallBet] = useState(0);
  const [allTallBet, setAllTallBet] = useState(0);
  const [allNumbersBet, setAllNumbersBet] = useState(0);
  const [allSmallHits, setAllSmallHits] = useState([]);
  const [allTallHits, setAllTallHits] = useState([]);
  const [allNumbersHits, setAllNumbersHits] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(true);

  // ── SHOOTER ROTATION STATE ──
  const [currentShooterIdx, setCurrentShooterIdx] = useState(0);
  const [autoRolling, setAutoRolling] = useState(false);
  const [shooterPaused, setShooterPaused] = useState(true);
  const autoRollTimerRef = useRef(null);
  const currentShooter = SHOOTERS[currentShooterIdx];
  const nextShooter = SHOOTERS[(currentShooterIdx + 1) % SHOOTERS.length];
  const isBotShooter = rotationEnabled && currentShooter.isBot;

  const sessionStartRef = useRef(Date.now());
  const betTracker = useRef({ smart:0, ok:0, trash:0, smartAmt:0, okAmt:0, trashAmt:0, total:0, onStrat:0, offStrat:0, peak:500, trough:500 });
  const logRef = useRef(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0; }, [log]);

  const totalBets = Object.values(bets).reduce((s, v) => s + v, 0) + allSmallBet + allTallBet + allNumbersBet;
  const lastRollRef = useRef({ d1: 3, d2: 4, total: 7 });

  const addLog = useCallback((msg, type = "info") => {
    setLog((p) => [...p.slice(-80), { msg, type, id: Date.now() + Math.random() }]);
  }, []);

  const coachEnabledRef = useRef(coachEnabled);
  useEffect(() => { coachEnabledRef.current = coachEnabled; }, [coachEnabled]);

  // ═══════════════════ INSTINCT ENGINE ═══════════════════
  const getLocalInstinct = (snap) => {
    const p = snap.phase;
    const pt = snap.point;
    const b = snap.bets;
    const br = snap.bankroll;
    const sb = snap.startingBankroll;
    const cp = snap.comePoints || [];
    const dcp = snap.dontComePoints || [];
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

    if (hasBadBets)
      return { instinct: "When you put money in the center of the table, you're paying 11-17% edge. That's not strategy, it's a donation.", why: "Any 7 is 16.67% edge. Props look exciting but the math is brutal.", action: "Remove prop bets. Move that money to odds instead.", risk: "high", risk_note: "Prop bets are dragging your efficiency down.", warnings: "Center bets are the casino's rent money." };
    if (hasHardways)
      return { instinct: "When you bet Hardways, you need one exact combination to win vs many ways to lose.", why: "Hard 6: 1 way to win, 10 ways to lose (5 easy + 6 sevens). That's 9.09% edge.", action: "Hardways are fun money only. Never a core bet.", risk: "high", risk_note: "Hardway edge is 9-11%.", warnings: null };

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
  };

  const askCoach = async (snapshot) => {
    if (!coachEnabledRef.current) return;
    setCoachLoading(true);
    // Local rules engine only — no external API calls
    const local = getLocalInstinct(snapshot);
    setCoachAdvice(local);
    setCoachLoading(false);
  };

  const coachRollCount = useRef(0);
  useEffect(() => {
    if (rollCount > 0 && rollCount !== coachRollCount.current) {
      coachRollCount.current = rollCount;
      askCoach({
        phase, point, bets, bankroll, startingBankroll, betUnit, maxOdds, activeStrategy,
        totalAtRisk: Object.values(bets).reduce((s, v) => s + v, 0) + comePoints.reduce((s, c) => s + c.amount + c.odds, 0) + dontComePoints.reduce((s, d) => s + d.amount + d.odds, 0),
        comePoints, dontComePoints, rollCount, sessionWins, sessionLosses,
        lastRoll: lastRollRef.current, lastResult: log.length > 0 ? log[log.length - 1].msg : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollCount]);

  const getMaxOddsAmt = (flatBet, ptNum) => {
    if (maxOdds === "1x") return flatBet;
    if (maxOdds === "2x") return flatBet * 2;
    if (maxOdds === "5x") return flatBet * 5;
    if (maxOdds === "10x") return flatBet * 10;
    if (ptNum === 4 || ptNum === 10) return flatBet * 3;
    if (ptNum === 5 || ptNum === 9) return flatBet * 4;
    return flatBet * 5;
  };

  const getBetIncrement = (key) => {
    if (key === "place6" || key === "place8") return 6;
    if (key === "horn") return 4;
    return betUnit;
  };

  const SMART_BETS = new Set(["pass","dontPass","come","dontCome","passOdds","dontPassOdds","place6","place8"]);
  const OK_BETS = new Set(["field","place5","place9","buy4","buy10"]);

  const classifyBet = (key) => SMART_BETS.has(key) || key.includes("Odds") ? "smart" : OK_BETS.has(key) ? "ok" : "trash";

  const isOnStrategy = (key) => {
    if (!activeStrategy) return true;
    if (activeStrategy === "conservative") return ["pass","passOdds","dontPass","dontPassOdds"].includes(key);
    if (activeStrategy === "veteran") return ["pass","passOdds","dontPass","dontPassOdds","place6","place8"].includes(key);
    if (activeStrategy === "molly") return ["pass","passOdds","dontPass","dontPassOdds","come","comeOdds"].includes(key);
    return true;
  };

  const trackBet = (key, amt) => {
    const cat = classifyBet(key);
    const t = betTracker.current;
    t.total++;
    if (cat === "smart") { t.smart++; t.smartAmt += amt; }
    else if (cat === "ok") { t.ok++; t.okAmt += amt; }
    else { t.trash++; t.trashAmt += amt; }
    if (isOnStrategy(key)) t.onStrat++; else t.offStrat++;
  };

  useEffect(() => {
    const t = betTracker.current;
    if (bankroll > t.peak) t.peak = bankroll;
    if (bankroll < t.trough) t.trough = bankroll;
  }, [bankroll]);

  const placeBet = (key) => {
    if (bankroll < betUnit) return;
    if (key === "passOdds" && bets.pass === 0) return;
    if (key === "dontPassOdds" && bets.dontPass === 0) return;
    if (key === "comeOdds" && comePoints.length === 0) return;
    if (key === "dontComeOdds" && dontComePoints.length === 0) return;
    if ((key === "pass" || key === "dontPass") && phase !== "comeout" && bets[key] === 0) return;
    if (key === "passOdds") { const max = getMaxOddsAmt(bets.pass, point); if (bets.passOdds >= max) return; }
    if (key === "dontPassOdds") { const max = getMaxOddsAmt(bets.dontPass, point); if (bets.dontPassOdds >= max) return; }
    var inc = getBetIncrement(key);
    if (bankroll < inc) return;
    trackBet(key, inc);
    setBets((p) => ({ ...p, [key]: p[key] + inc }));
    setBankroll((p) => p - inc);
  };
  const removeBet = (key) => {
    if (bets[key] <= 0) return;
    if ((key === "pass" || key === "dontPass") && phase === "point") return;
    const inc = getBetIncrement(key);
    const amt = Math.min(bets[key], inc);
    setBets((p) => ({ ...p, [key]: p[key] - amt }));
    setBankroll((p) => p + amt);
  };

  const addComeOdds = (idx) => {
    if (bankroll < betUnit) return;
    trackBet("comeOdds_post", betUnit);
    setComePoints((p) => p.map((cp, i) => {
      if (i !== idx) return cp;
      const max = getMaxOddsAmt(cp.amount, cp.number);
      if (cp.odds >= max) return cp;
      setBankroll((prev) => prev - betUnit);
      return { ...cp, odds: cp.odds + betUnit };
    }));
  };
  const removeComeOdds = (idx) => {
    setComePoints((p) => p.map((cp, i) => {
      if (i !== idx || cp.odds <= 0) return cp;
      const amt = Math.min(cp.odds, betUnit);
      setBankroll((prev) => prev + amt);
      return { ...cp, odds: cp.odds - amt };
    }));
  };
  const addDcOdds = (idx) => {
    if (bankroll < betUnit) return;
    trackBet("dcOdds_post", betUnit);
    setDontComePoints((p) => p.map((dp, i) => {
      if (i !== idx) return dp;
      const max = getMaxOddsAmt(dp.amount, dp.number);
      if (dp.odds >= max) return dp;
      setBankroll((prev) => prev - betUnit);
      return { ...dp, odds: dp.odds + betUnit };
    }));
  };
  const removeDcOdds = (idx) => {
    setDontComePoints((p) => p.map((dp, i) => {
      if (i !== idx || dp.odds <= 0) return dp;
      const amt = Math.min(dp.odds, betUnit);
      setBankroll((prev) => prev + amt);
      return { ...dp, odds: dp.odds - amt };
    }));
  };
  const win = (key, payout) => { const amt = bets[key]; if (amt <= 0) return 0; setBankroll((p) => p + amt + payout); setBets((p) => ({ ...p, [key]: 0 })); setSessionWins((p) => p + payout); return payout; };
  const lose = (key) => { const amt = bets[key]; if (amt <= 0) return 0; setBets((p) => ({ ...p, [key]: 0 })); setSessionLosses((p) => p + amt); return amt; };
  const push = (key) => { const amt = bets[key]; if (amt <= 0) return; setBankroll((p) => p + amt); setBets((p) => ({ ...p, [key]: 0 })); };

  const rollDice = () => {
    if (rolling || totalBets === 0) return;
    setRolling(true);
    if (soundEnabled) playDiceRoll();
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const isHard = d1 === d2;
    setTimeout(() => {
      setDie1(d1); setDie2(d2); lastRollRef.current = { d1, d2, total };
      setRolling(false); setRollCount((p) => p + 1);
      var phaseBeforeRoll = phase;
      let results = [];
      if (bets.field > 0) { if (total === 2) { const w = win("field", bets.field * 2); results.push(`Field WIN +$${w}`); } else if (total === 12) { const w = win("field", bets.field * 3); results.push(`Field WIN +$${w}`); } else if ([3,4,9,10,11].includes(total)) { const w = win("field", bets.field); results.push(`Field WIN +$${w}`); } else { const l = lose("field"); results.push(`Field LOSE -$${l}`); } }
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
        if (total === 7 || total === 11) { if (bets.pass > 0) { const w = win("pass",bets.pass); results.push(`Pass WIN +$${w}`); } if (bets.dontPass > 0) { const l = lose("dontPass"); results.push(`DP LOSE -$${l}`); } if (bets.passOdds > 0) push("passOdds"); if (bets.dontPassOdds > 0) push("dontPassOdds"); addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — ${total===7?"SEVEN":"YO!"} ${results.join(" | ")}`, results.some(r=>r.includes("WIN"))?"win":"lose"); }
        else if ([2,3,12].includes(total)) { if (bets.pass > 0) { const l = lose("pass"); results.push(`Pass LOSE -$${l}`); } if (bets.dontPass > 0) { if (total===12) { push("dontPass"); results.push("DP PUSH"); } else { const w = win("dontPass",bets.dontPass); results.push(`DP WIN +$${w}`); } } if (bets.passOdds > 0) push("passOdds"); if (bets.dontPassOdds > 0) push("dontPassOdds"); addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — CRAPS! ${results.join(" | ")}`, results.some(r=>r.includes("WIN"))?"win":"lose"); }
        else { setPoint(total); setPhase("point"); results.push(`Point: ${total}`); addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — Point set: ${total}. ${results.join(" | ")}`, "point"); }
      } else {
        if (total === point) {
          if (bets.pass > 0) { const w = win("pass",bets.pass); results.push(`Pass WIN +$${w}`); }
          if (bets.passOdds > 0) { const [n,d] = ODDS_PAY[point]; const w = win("passOdds",Math.floor(bets.passOdds*n/d)); results.push(`Odds WIN +$${w}`); }
          if (bets.dontPass > 0) { const l = lose("dontPass"); results.push(`DP LOSE -$${l}`); }
          if (bets.dontPassOdds > 0) { const l = lose("dontPassOdds"); results.push(`DPO LOSE -$${l}`); }
          setPoint(null); setPhase("comeout"); addLog(`🎲 ${d1}+${d2}=${total} [${currentShooter.name}] — HIT THE POINT! ${results.join(" | ")}`, "win");
        } else if (total === 7) {
          if (bets.pass > 0) { const l = lose("pass"); results.push(`Pass LOSE -$${l}`); }
          if (bets.passOdds > 0) { const l = lose("passOdds"); results.push(`Odds LOSE -$${l}`); }
          if (bets.dontPass > 0) { const w = win("dontPass",bets.dontPass); results.push(`DP WIN +$${w}`); }
          if (bets.dontPassOdds > 0) { const [n,d] = ODDS_PAY[point]; const w = win("dontPassOdds",Math.floor(bets.dontPassOdds*d/n)); results.push(`DPO WIN +$${w}`); }
          setComePoints([]); setDontComePoints([]); setPoint(null); setPhase("comeout");
          // ── PASS THE DICE ──
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

      // ── Auto-pause bot shooter after any win/lose so user can adjust bets ──
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
    }, 500);
  };

  // ── AUTO-ROLL FOR BOT SHOOTERS ──
  useEffect(() => {
    if (autoRolling && !shooterPaused && isBotShooter && !rolling && totalBets > 0 && !showSetup) {
      autoRollTimerRef.current = setTimeout(() => rollDice(), 1500);
    }
    return () => { if (autoRollTimerRef.current) clearTimeout(autoRollTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRolling, shooterPaused, isBotShooter, rolling, rollCount, totalBets, showSetup]);

  // ── ROLL BUTTON HANDLER ──
  const handleRollButton = () => {
    if (rolling) return;
    if (!isBotShooter) {
      if (totalBets === 0) return;
      rollDice();
      return;
    }
    if (totalBets === 0) return;
    if (shooterPaused) {
      setAutoRolling(true);
      setShooterPaused(false);
    } else {
      setShooterPaused(true);
      setAutoRolling(false);
      if (autoRollTimerRef.current) clearTimeout(autoRollTimerRef.current);
    }
  };

  const rollBtnLabel = () => {
    if (rolling) return "Rolling...";
    if (totalBets === 0) return "Place bets first";
    if (!isBotShooter) return `ROLL 🎲  ($${totalBets} at risk)`;
    if (shooterPaused) return `▶ Start ${currentShooter.name}'s Hand`;
    return `⏸ Pause ${currentShooter.name}`;
  };

  const resetSession = () => {
    setBets(initialBets()); setPoint(null); setPhase("comeout"); setLog([]);
    setRollCount(0); setSessionWins(0); setSessionLosses(0);
    setComePoints([]); setDontComePoints([]); setBankroll(startingBankroll);
    setShowSetup(true); setCoachAdvice(null); setLastRollNet(null);
    setAllSmallBet(0); setAllTallBet(0); setAllNumbersBet(0); setAllSmallHits([]); setAllTallHits([]); setAllNumbersHits([]);
    setCurrentShooterIdx(0); setAutoRolling(false); setShooterPaused(true);
  };

  const pnl = bankroll - startingBankroll + totalBets;
  const buildSnapshot = () => ({
    phase, point, bets, bankroll, startingBankroll, betUnit, maxOdds, activeStrategy,
    totalAtRisk: totalBets + comePoints.reduce((s,c)=>s+c.amount+c.odds,0) + dontComePoints.reduce((s,d)=>s+d.amount+d.odds,0),
    comePoints, dontComePoints, rollCount, sessionWins, sessionLosses,
    lastRoll: lastRollRef.current, lastResult: log.length > 0 ? log[log.length-1].msg : "No rolls yet",
  });

  const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap'); @keyframes diceTumble { 0%{transform:translateY(-18px) rotate(-180deg) scale(.7);opacity:.3} 30%{transform:translateY(4px) rotate(40deg) scale(1.08);opacity:1} 50%{transform:translateY(-6px) rotate(-15deg) scale(1.02)} 70%{transform:translateY(2px) rotate(5deg) scale(1)} 85%{transform:translateY(-1px) rotate(-2deg)} 100%{transform:translateY(0) rotate(0) scale(1)} } @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} } @keyframes pulseGreen { 0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,.4)} 50%{box-shadow:0 0 0 8px rgba(76,175,80,0)} } @keyframes pulsePurple { 0%,100%{box-shadow:0 0 0 0 rgba(156,39,176,.4)} 50%{box-shadow:0 0 0 8px rgba(156,39,176,0)} } *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#333;border-radius:2px}`;
  const mono = "'JetBrains Mono', monospace";
  const pnl_ = { background: "#12121f", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" };

  if (showSetup) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0a14", color:"#e0e0e0", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <style>{CSS}</style>
        <div style={{ width:"100%", maxWidth:420, animation:"fadeIn .5s ease-out" }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:14, letterSpacing:".2em", color:"#4caf50", fontWeight:600, marginBottom:8 }}>CRAPS TRAINER</div>
            <div style={{ fontSize:28, fontWeight:700, color:"#fff", marginBottom:4 }}>Session Setup</div>
            <div style={{ fontSize:13, color:"#666" }}>You're at a table with Mike, Sarah & Tom. Dice rotate on seven-outs.</div>
          </div>
          <div style={{ ...pnl_, padding:28 }}>
            <label style={{ fontSize:12, color:"#888", fontWeight:600, letterSpacing:".1em", display:"block", marginBottom:8 }}>BANKROLL</label>
            <div style={{ display:"flex", gap:8, marginBottom:24 }}>
              {[200,500,1000,2000].map(v=>(
                <button key={v} onClick={()=>{setBankroll(v);setStartingBankroll(v)}} style={{ flex:1, padding:"10px 0", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer", background:startingBankroll===v?"rgba(76,175,80,.15)":"rgba(255,255,255,.03)", color:startingBankroll===v?"#4caf50":"#888", border:`1px solid ${startingBankroll===v?"rgba(76,175,80,.3)":"rgba(255,255,255,.06)"}`, transition:"all .2s" }}>${v}</button>
              ))}
            </div>
            <label style={{ fontSize:12, color:"#888", fontWeight:600, letterSpacing:".1em", display:"block", marginBottom:8 }}>BET UNIT</label>
            <div style={{ display:"flex", gap:8, marginBottom:24 }}>
              {[5,10,15,25].map(v=>(
                <button key={v} onClick={()=>setBetUnit(v)} style={{ flex:1, padding:"10px 0", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer", background:betUnit===v?"rgba(76,175,80,.15)":"rgba(255,255,255,.03)", color:betUnit===v?"#4caf50":"#888", border:`1px solid ${betUnit===v?"rgba(76,175,80,.3)":"rgba(255,255,255,.06)"}`, transition:"all .2s" }}>${v}</button>
              ))}
            </div>
            <label style={{ fontSize:12, color:"#888", fontWeight:600, letterSpacing:".1em", display:"block", marginBottom:8 }}>MAX ODDS</label>
            <div style={{ display:"flex", gap:6, marginBottom:28, flexWrap:"wrap" }}>
              {[{v:"1x",l:"1×"},{v:"2x",l:"2×"},{v:"345x",l:"3-4-5×"},{v:"5x",l:"5×"},{v:"10x",l:"10×"}].map(o=>(
                <button key={o.v} onClick={()=>setMaxOdds(o.v)} style={{ flex:1, padding:"10px 0", borderRadius:8, fontSize:o.v==="345x"?13:15, fontWeight:600, cursor:"pointer", background:maxOdds===o.v?"rgba(76,175,80,.15)":"rgba(255,255,255,.03)", color:maxOdds===o.v?"#4caf50":"#888", border:`1px solid ${maxOdds===o.v?"rgba(76,175,80,.3)":"rgba(255,255,255,.06)"}`, transition:"all .2s", minWidth:0 }}>{o.l}</button>
              ))}
            </div>
            <button onClick={()=>setShowSetup(false)} style={{ width:"100%", padding:"14px 0", borderRadius:10, fontSize:16, fontWeight:700, background:"linear-gradient(135deg,#2e7d32,#4caf50)", color:"#fff", border:"none", cursor:"pointer", boxShadow:"0 4px 20px rgba(76,175,80,.3)" }}>Start Session →</button>
          </div>
          <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:"#555" }}>You shoot first. Seven-out passes dice clockwise.</div>
        </div>
      </div>
    );
  }

  const tabs = [{id:"line",label:"Line"},{id:"place",label:"Place/Buy"},{id:"props",label:"Props"},{id:"bonus",label:"Bonus"}];

  const PhaseTag = ()=>(<span style={{ fontSize:11, padding:"3px 10px", borderRadius:4, background:phase==="comeout"?"rgba(33,150,243,.15)":"rgba(255,152,0,.15)", color:phase==="comeout"?"#2196f3":"#ff9800", fontWeight:600, fontFamily:mono }}>{phase==="comeout"?"COME OUT":`POINT: ${point}`}</span>);

  const ShooterTag = ({compact})=>(
    <span style={{
      fontSize:compact?10:11, padding:"3px 10px", borderRadius:4,
      background:isBotShooter?"rgba(156,39,176,.15)":"rgba(76,175,80,.15)",
      color:isBotShooter?"#ba68c8":"#4caf50",
      fontWeight:600, fontFamily:mono, whiteSpace:"nowrap",
    }}>
      🎲 {currentShooter.name}{!compact&&isBotShooter&&` · next: ${nextShooter.name}`}
    </span>
  );

  const Stat = ({label,value,color="#fff"})=>(<div style={{textAlign:isDesktop?"center":"right"}}><div style={{fontSize:10,color:"#666",fontWeight:600}}>{label}</div><div style={{fontSize:isDesktop?18:16,fontWeight:700,color,fontFamily:mono}}>{value}</div></div>);

  const ComePointPills = ()=>(comePoints.length>0||dontComePoints.length>0) ? (
    <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:10}}>
      {comePoints.map((cp,i)=><span key={`c${i}`} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"rgba(76,175,80,.15)",color:"#4caf50",fontFamily:mono,fontWeight:600}}>COME {cp.number} ${cp.amount}{cp.odds>0?` +$${cp.odds}`:""}</span>)}
      {dontComePoints.map((dp,i)=><span key={`d${i}`} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"rgba(244,67,54,.15)",color:"#f44336",fontFamily:mono,fontWeight:600}}>DC {dp.number} ${dp.amount}{dp.odds>0?` +$${dp.odds}`:""}</span>)}
    </div>
  ) : null;

  const SmallBtn = ({onClick,disabled,color="#4caf50",children})=>(
    <button onClick={onClick} disabled={disabled} style={{
      padding:"2px 7px",fontSize:10,borderRadius:3,fontWeight:700,cursor:disabled?"not-allowed":"pointer",
      background:disabled?"#222":`${color}18`,color:disabled?"#444":color,
      border:`1px solid ${disabled?"#333":`${color}44`}`,lineHeight:1,
    }}>{children}</button>
  );

  const allBetsAtRisk = Object.entries(bets).filter(([,v])=>v>0);
  const comeTotal = comePoints.reduce((s,c)=>s+c.amount+c.odds,0);
  const dcTotal = dontComePoints.reduce((s,d)=>s+d.amount+d.odds,0);
  const hasAnything = allBetsAtRisk.length > 0 || comePoints.length > 0 || dontComePoints.length > 0;

  const BET_LABELS = {pass:"Pass Line",dontPass:"Don't Pass",passOdds:"Pass Odds",dontPassOdds:"DP Odds",come:"Come (pending)",dontCome:"DC (pending)",comeOdds:"Come Odds (pre)",dontComeOdds:"DC Odds (pre)",place4:"Place 4",place5:"Place 5",place6:"Place 6",place8:"Place 8",place9:"Place 9",place10:"Place 10",field:"Field",hardway4:"Hard 4",hardway6:"Hard 6",hardway8:"Hard 8",hardway10:"Hard 10",any7:"Any 7",anyCraps:"Any Craps",yo:"Yo",boxcars:"Boxcars",aces:"Aces",buy4:"Buy 4",buy10:"Buy 10",horn:"Horn",ce:"C&E"};

  const ActiveBets = ()=>{
    if (!hasAnything) return (
      <div style={{...pnl_,padding:"14px",textAlign:"center"}}>
        <div style={{fontSize:12,color:"#444",fontStyle:"italic"}}>No bets on the table</div>
      </div>
    );
    const lineKeys = ["pass","passOdds","dontPass","dontPassOdds"];
    const placeKeys = ["place4","place5","place6","place8","place9","place10"];
    const otherKeys = ["come","comeOdds","dontCome","dontComeOdds","field","hardway4","hardway6","hardway8","hardway10","any7","anyCraps","yo","boxcars","aces"];
    const activeLine = lineKeys.filter(k=>bets[k]>0);
    const activePlace = placeKeys.filter(k=>bets[k]>0);
    const activeOther = otherKeys.filter(k=>bets[k]>0);

    const BetRow = ({label,amount,he,accent="#888"})=>(
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",fontSize:12}}>
        <span style={{color:"#aaa"}}>{label}</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontFamily:mono,fontWeight:600,color:accent}}>${amount}</span>
          {he!==undefined&&<span style={{fontSize:9,color:ratingColor(he),fontFamily:mono}}>{he}%</span>}
        </div>
      </div>
    );

    const ComeRow = ({type,cp,idx})=>{
      const isCome = type==="come";
      const color = isCome?"#4caf50":"#f44336";
      const addFn = isCome?addComeOdds:addDcOdds;
      const rmFn = isCome?removeComeOdds:removeDcOdds;
      const maxOddsAmt = getMaxOddsAmt(cp.amount, cp.number);
      const atMax = cp.odds >= maxOddsAmt;
      return (
        <div style={{padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:color,display:"inline-block"}} />
              <span style={{fontSize:12,color:"#ccc",fontWeight:600}}>{isCome?"Come":"DC"} on {cp.number}</span>
            </div>
            <span style={{fontFamily:mono,fontWeight:600,color,fontSize:12}}>${cp.amount}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingLeft:12}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:"#888"}}>Odds:</span>
              <span style={{fontFamily:mono,fontWeight:600,color:cp.odds>0?"#00e676":"#555",fontSize:12}}>${cp.odds}</span>
              <span style={{fontSize:9,color:atMax?"#00e676":"#555",fontFamily:mono}}>/{maxOddsAmt}</span>
              <Badge he={0} />
            </div>
            <div style={{display:"flex",gap:3}}>
              <SmallBtn onClick={()=>addFn(idx)} disabled={bankroll<betUnit||atMax} color="#4caf50">+</SmallBtn>
              <SmallBtn onClick={()=>rmFn(idx)} disabled={cp.odds<=0} color="#f44336">−</SmallBtn>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div style={{...pnl_,padding:"10px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",color:"#666"}}>ACTIVE BETS</span>
          <span style={{fontSize:11,fontFamily:mono,fontWeight:700,color:"#ff9800"}}>${totalBets+comeTotal+dcTotal} at risk</span>
        </div>

        {activeLine.length>0&&<>
          <div style={{fontSize:9,color:"#555",letterSpacing:".1em",fontWeight:600,marginTop:4,marginBottom:2}}>LINE</div>
          {activeLine.map(k=><BetRow key={k} label={BET_LABELS[k]} amount={bets[k]} he={HOUSE_EDGES[k.includes("Odds")?"odds":k]} accent={k.includes("Odds")?"#00e676":"#4caf50"} />)}
        </>}

        {comePoints.length>0&&<>
          <div style={{fontSize:9,color:"#555",letterSpacing:".1em",fontWeight:600,marginTop:8,marginBottom:2}}>COME POINTS</div>
          {comePoints.map((cp,i)=><ComeRow key={`c${i}`} type="come" cp={cp} idx={i} />)}
        </>}

        {dontComePoints.length>0&&<>
          <div style={{fontSize:9,color:"#555",letterSpacing:".1em",fontWeight:600,marginTop:8,marginBottom:2}}>DON'T COME POINTS</div>
          {dontComePoints.map((dp,i)=><ComeRow key={`d${i}`} type="dc" cp={dp} idx={i} />)}
        </>}

        {activePlace.length>0&&<>
          <div style={{fontSize:9,color:"#555",letterSpacing:".1em",fontWeight:600,marginTop:8,marginBottom:2}}>PLACE</div>
          {activePlace.map(k=><BetRow key={k} label={BET_LABELS[k]} amount={bets[k]} he={HOUSE_EDGES[k]} accent="#ffc107" />)}
        </>}

        {activeOther.length>0&&<>
          <div style={{fontSize:9,color:"#555",letterSpacing:".1em",fontWeight:600,marginTop:8,marginBottom:2}}>OTHER</div>
          {activeOther.map(k=><BetRow key={k} label={BET_LABELS[k]} amount={bets[k]} he={HOUSE_EDGES[k]} accent="#888" />)}
        </>}
      </div>
    );
  };

  const ROLL_PROB = {2:1,3:2,4:3,5:4,6:5,7:6,8:5,9:4,10:3,11:2,12:1};

  const calcOutcome = (total) => {
    let net = 0;
    const isPointPhase = phase === "point";

    if (bets.field > 0) {
      if (total === 2) net += bets.field * 2;
      else if (total === 12) net += bets.field * 3;
      else if ([3,4,9,10,11].includes(total)) net += bets.field;
      else net -= bets.field;
    }
    if (bets.any7 > 0) { net += total === 7 ? bets.any7 * 4 : -bets.any7; }
    if (bets.anyCraps > 0) { net += [2,3,12].includes(total) ? bets.anyCraps * 7 : -bets.anyCraps; }
    if (bets.yo > 0) { net += total === 11 ? bets.yo * 15 : -bets.yo; }
    if (bets.boxcars > 0) { net += total === 12 ? bets.boxcars * 30 : -bets.boxcars; }
    if (bets.aces > 0) { net += total === 2 ? bets.aces * 30 : -bets.aces; }

    Object.entries({hardway4:4,hardway6:6,hardway8:8,hardway10:10}).forEach(([k,num])=>{
      if (bets[k] > 0) {
        if (total === 7 || total === num) net -= bets[k];
      }
    });

    if (isPointPhase) {
      [4,5,6,8,9,10].forEach(num=>{
        const k = `place${num}`;
        if (bets[k] > 0) {
          if (total === num) { const [n,d] = PLACE_PAY[num]; net += Math.floor(bets[k]*n/d); }
          else if (total === 7) net -= bets[k];
        }
      });
    }

    if (isPointPhase) {
      if (bets.pass > 0) { if (total === point) net += bets.pass; else if (total === 7) net -= bets.pass; }
      if (bets.passOdds > 0) {
        if (total === point) { const [n,d] = ODDS_PAY[point]; net += Math.floor(bets.passOdds*n/d); }
        else if (total === 7) net -= bets.passOdds;
      }
      if (bets.dontPass > 0) { if (total === 7) net += bets.dontPass; else if (total === point) net -= bets.dontPass; }
      if (bets.dontPassOdds > 0) {
        if (total === 7) { const [n,d] = ODDS_PAY[point]; net += Math.floor(bets.dontPassOdds*d/n); }
        else if (total === point) net -= bets.dontPassOdds;
      }
    } else {
      if (bets.pass > 0) { if (total === 7 || total === 11) net += bets.pass; else if ([2,3,12].includes(total)) net -= bets.pass; }
      if (bets.dontPass > 0) { if ([2,3].includes(total)) net += bets.dontPass; else if (total === 7 || total === 11) net -= bets.dontPass; }
    }

    if (isPointPhase) {
      comePoints.forEach(cp=>{
        if (total === cp.number) { net += cp.amount + (cp.odds > 0 ? Math.floor(cp.odds*(ODDS_PAY[cp.number][0]/ODDS_PAY[cp.number][1])) : 0); }
        else if (total === 7) net -= cp.amount + cp.odds;
      });
      dontComePoints.forEach(dp=>{
        if (total === 7) { net += dp.amount + (dp.odds > 0 ? Math.floor(dp.odds*(ODDS_PAY[dp.number][1]/ODDS_PAY[dp.number][0])) : 0); }
        else if (total === dp.number) net -= dp.amount + dp.odds;
      });
    }
    if (isPointPhase && bets.come > 0) { if (total === 7 || total === 11) net += bets.come; else if ([2,3,12].includes(total)) net -= bets.come; }
    if (isPointPhase && bets.dontCome > 0) { if ([2,3].includes(total)) net += bets.dontCome; else if (total === 7 || total === 11) net -= bets.dontCome; }

    return net;
  };

  const ExposureMap = () => {
    const outcomes = [];
    for (let t = 2; t <= 12; t++) outcomes.push({ total: t, net: calcOutcome(t), prob: ROLL_PROB[t] / 36 });
    const maxAbs = Math.max(...outcomes.map(o => Math.abs(o.net)), 1);
    const totalExposure = comeTotal + dcTotal + totalBets;
    if (totalExposure === 0) return null;

    const ev = outcomes.reduce((s, o) => s + o.net * o.prob, 0);
    const worstLoss = Math.min(...outcomes.map(o=>o.net));
    const bestWin = Math.max(...outcomes.map(o=>o.net));

    return (
      <div style={{...pnl_,padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",color:"#666"}}>EXPOSURE MAP</span>
          <span style={{fontSize:10,fontFamily:mono,color:"#666"}}>Max Odds: {maxOdds === "345x" ? "3-4-5×" : maxOdds.replace("x","×")}</span>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <div style={{flex:1,padding:"6px 8px",borderRadius:6,background:"rgba(76,175,80,.06)",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#666",fontWeight:600,letterSpacing:".1em"}}>BEST ROLL</div>
            <div style={{fontSize:14,fontWeight:700,color:"#4caf50",fontFamily:mono}}>+${bestWin}</div>
          </div>
          <div style={{flex:1,padding:"6px 8px",borderRadius:6,background:"rgba(244,67,54,.06)",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#666",fontWeight:600,letterSpacing:".1em"}}>WORST ROLL</div>
            <div style={{fontSize:14,fontWeight:700,color:"#f44336",fontFamily:mono}}>{worstLoss >= 0 ? `+$${worstLoss}` : `-$${Math.abs(worstLoss)}`}</div>
          </div>
          <div style={{flex:1,padding:"6px 8px",borderRadius:6,background:"rgba(33,150,243,.06)",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#666",fontWeight:600,letterSpacing:".1em"}}>EV / ROLL</div>
            <div style={{fontSize:14,fontWeight:700,color:ev>=0?"#4caf50":"#f44336",fontFamily:mono}}>{ev>=0?"+":""}${ev.toFixed(2)}</div>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {outcomes.map(o=>{
            const pct = maxAbs > 0 ? Math.abs(o.net) / maxAbs * 100 : 0;
            const isWin = o.net > 0;
            const isZero = o.net === 0;
            const color = isZero ? "#444" : isWin ? "#4caf50" : "#f44336";
            const probPct = (o.prob * 100).toFixed(1);
            return (
              <div key={o.total} style={{display:"flex",alignItems:"center",gap:0,height:22}}>
                <div style={{width:24,fontSize:11,fontWeight:700,color:o.total===7?"#ff9800":"#888",fontFamily:mono,textAlign:"right",paddingRight:6}}>{o.total}</div>
                <div style={{width:36,fontSize:9,color:"#555",fontFamily:mono,textAlign:"right",paddingRight:6}}>{probPct}%</div>
                <div style={{flex:1,display:"flex",alignItems:"center",height:16,position:"relative"}}>
                  <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(255,255,255,.08)"}} />
                  {isWin ? (
                    <div style={{position:"absolute",left:"50%",height:12,borderRadius:"0 3px 3px 0",background:`${color}44`,border:`1px solid ${color}66`,borderLeft:"none",width:`${pct/2}%`,transition:"width .3s"}} />
                  ) : !isZero ? (
                    <div style={{position:"absolute",right:"50%",height:12,borderRadius:"3px 0 0 3px",background:`${color}44`,border:`1px solid ${color}66`,borderRight:"none",width:`${pct/2}%`,transition:"width .3s"}} />
                  ) : null}
                </div>
                <div style={{width:52,fontSize:10,fontWeight:600,color,fontFamily:mono,textAlign:"right"}}>
                  {isZero?"—":isWin?`+$${o.net}`:`-$${Math.abs(o.net)}`}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:9,color:"#555"}}>
          <span>← losses</span>
          <span>wins →</span>
        </div>
      </div>
    );
  };

  const STRATS = [
    {id:"conservative",label:"Conservative",short:"Pass + Odds",color:"#4caf50"},
    {id:"veteran",label:"Veteran",short:"Pass + 6/8",color:"#2196f3"},
    {id:"molly",label:"3-Pt Molly",short:"Pass + 2 Comes",color:"#ff9800"},
  ];

  const StrategyGuide = ()=>{
    const Step = ({done,active,text})=>(
      <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"4px 0"}}>
        <div style={{width:18,height:18,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,
          background:done?"rgba(76,175,80,.2)":active?"rgba(255,152,0,.2)":"rgba(255,255,255,.03)",
          border:`1.5px solid ${done?"#4caf50":active?"#ff9800":"#333"}`,
          fontSize:10,color:done?"#4caf50":active?"#ff9800":"#555",fontWeight:700,
        }}>{done?"✓":active?"→":""}</div>
        <span style={{fontSize:12,lineHeight:1.4,color:done?"#666":active?"#e0e0e0":"#555",textDecoration:done?"line-through":"none"}}>{text}</span>
      </div>
    );

    const getSteps = ()=>{
      if (!activeStrategy) return null;
      const hasPass = bets.pass > 0;
      const passOddsMax = point ? getMaxOddsAmt(bets.pass, point) : 0;
      const passOddsDone = point && bets.passOdds >= passOddsMax && passOddsMax > 0;
      const isComeout = phase === "comeout";
      const has6 = bets.place6 > 0;
      const has8 = bets.place8 > 0;
      const numComePoints = comePoints.length;
      const hasPendingCome = bets.come > 0;
      const comeOddsAllMaxed = comePoints.every(cp => cp.odds >= getMaxOddsAmt(cp.amount, cp.number));

      if (activeStrategy === "conservative") {
        const steps = [];
        if (isComeout) {
          steps.push({done:hasPass, active:!hasPass, text:`Place Pass Line ($${betUnit})`});
          steps.push({done:false, active:false, text:"Wait for point to be set"});
          steps.push({done:false, active:false, text:"Max your odds behind the Pass"});
          steps.push({done:false, active:false, text:"Stop. Watch. Collect or reset."});
        } else {
          steps.push({done:hasPass, active:false, text:`Pass Line on ${point}`});
          steps.push({done:passOddsDone, active:!passOddsDone && hasPass, text:`Max odds behind Pass (${bets.passOdds}/${passOddsMax})`});
          steps.push({done:passOddsDone, active:false, text:"Stop. Watch. Collect or reset."});
        }
        return steps;
      }

      if (activeStrategy === "veteran") {
        const pointIs6or8 = point === 6 || point === 8;
        const need6 = !isComeout && point !== 6;
        const need8 = !isComeout && point !== 8;
        const steps = [];
        if (isComeout) {
          steps.push({done:hasPass, active:!hasPass, text:`Place Pass Line ($${betUnit})`});
          steps.push({done:false, active:false, text:"Wait for point to be set"});
          steps.push({done:false, active:false, text:"Max your odds"});
          steps.push({done:false, active:false, text:"Place 6 & 8 (if not the point)"});
          steps.push({done:false, active:false, text:"Stop. Collect or reset."});
        } else {
          steps.push({done:hasPass, active:false, text:`Pass Line on ${point}`});
          steps.push({done:passOddsDone, active:!passOddsDone&&hasPass, text:`Max odds (${bets.passOdds}/${passOddsMax})`});
          if (need6) steps.push({done:has6, active:!has6&&passOddsDone, text:"Place 6"});
          if (need8) steps.push({done:has8, active:!has8&&(passOddsDone||(need6&&has6)), text:"Place 8"});
          if (pointIs6or8) steps.push({done:true, active:false, text:`Point IS ${point} — no place needed`});
          const allDone = passOddsDone && (!need6||has6) && (!need8||has8);
          steps.push({done:allDone, active:false, text:"Stop. Collect or reset."});
        }
        return steps;
      }

      if (activeStrategy === "molly") {
        const steps = [];
        if (isComeout) {
          steps.push({done:hasPass, active:!hasPass, text:`Place Pass Line ($${betUnit})`});
          steps.push({done:false, active:false, text:"Wait for point to be set"});
          steps.push({done:false, active:false, text:"Max odds → Come bet → repeat to 3 points"});
        } else {
          steps.push({done:hasPass, active:false, text:`Pass on ${point}`});
          steps.push({done:passOddsDone, active:!passOddsDone&&hasPass, text:`Max Pass odds (${bets.passOdds}/${passOddsMax})`});
          for (let i = 0; i < comePoints.length; i++) {
            const cp = comePoints[i];
            const cpMax = getMaxOddsAmt(cp.amount, cp.number);
            const cpDone = cp.odds >= cpMax;
            steps.push({done:true, active:false, text:`Come on ${cp.number} ($${cp.amount})`});
            steps.push({done:cpDone, active:!cpDone, text:`Max odds on Come ${cp.number} (${cp.odds}/${cpMax})`});
          }
          if (hasPendingCome) steps.push({done:false, active:true, text:"Come bet pending — waiting for roll"});
          const needMore = numComePoints < 2;
          if (needMore && !hasPendingCome) {
            steps.push({done:false, active:comeOddsAllMaxed||numComePoints===0, text:`Place Come bet #${numComePoints+1}`});
          }
          const atTarget = numComePoints >= 2 && comeOddsAllMaxed;
          steps.push({done:atTarget, active:false, text:"3 numbers working. Stop. Collect or reset."});
        }
        return steps;
      }
      return null;
    };

    const steps = getSteps();

    return (
      <div style={{...pnl_,padding:"10px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",color:"#666"}}>STRATEGY</span>
          {activeStrategy&&<button onClick={()=>setActiveStrategy(null)} style={{fontSize:9,color:"#555",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>clear</button>}
        </div>
        <div style={{display:"flex",gap:4,marginBottom:steps?10:0}}>
          {STRATS.map(s=>(
            <button key={s.id} onClick={()=>setActiveStrategy(activeStrategy===s.id?null:s.id)} style={{
              flex:1,padding:"6px 4px",borderRadius:6,fontSize:10,fontWeight:600,cursor:"pointer",
              textAlign:"center",lineHeight:1.3,transition:"all .2s",
              background:activeStrategy===s.id?`${s.color}15`:"rgba(255,255,255,.02)",
              color:activeStrategy===s.id?s.color:"#666",
              border:`1px solid ${activeStrategy===s.id?`${s.color}33`:"rgba(255,255,255,.06)"}`,
            }}>
              <div>{s.label}</div>
              <div style={{fontSize:9,opacity:.7,marginTop:1}}>{s.short}</div>
            </button>
          ))}
        </div>

        {steps&&(
          <div style={{borderTop:"1px solid rgba(255,255,255,.04)",paddingTop:8}}>
            {steps.map((s,i)=><Step key={i} {...s} />)}
          </div>
        )}

        {!activeStrategy&&<div style={{fontSize:11,color:"#444",fontStyle:"italic",textAlign:"center",paddingTop:4}}>Pick a strategy to see your playbook</div>}
      </div>
    );
  };

  const TableView = () => {
    const Chip = ({amount, color="#4caf50", small}) => {
      if (!amount || amount <= 0) return null;
      const sz = small ? 20 : 24;
      return (
        <div style={{
          width:sz, height:sz, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          background:`radial-gradient(circle at 35% 35%, ${color}, ${color}aa)`,
          border:`2px solid ${color}dd`, boxShadow:`0 2px 6px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.3)`,
          fontSize:small?7:8, fontWeight:700, color:"#fff", fontFamily:mono, lineHeight:1,
          position:"relative", zIndex:2,
        }}>{amount}</div>
      );
    };

    const OddsChip = ({amount}) => {
      if (!amount || amount <= 0) return null;
      return (
        <div style={{
          width:18, height:18, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          background:"radial-gradient(circle at 35% 35%, #00e676, #00c853aa)",
          border:"2px solid #00e676bb", boxShadow:"0 1px 4px rgba(0,0,0,.4)",
          fontSize:7, fontWeight:700, color:"#fff", fontFamily:mono,
          position:"absolute", bottom:-6, right:-6, zIndex:3,
        }}>{amount}</div>
      );
    };

    const Puck = ({on}) => (
      <div style={{
        width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
        background:on?"#fff":"#333", border:`2px solid ${on?"#fff":"#555"}`,
        fontSize:7, fontWeight:800, color:on?"#000":"#888", fontFamily:mono,
        boxShadow:on?"0 0 8px rgba(255,255,255,.5)":"none",
      }}>{on?"ON":"OFF"}</div>
    );

    const comeByNum = {};
    comePoints.forEach(cp => { comeByNum[cp.number] = cp; });
    const dcByNum = {};
    dontComePoints.forEach(dp => { dcByNum[dp.number] = dp; });

    const placeNums = [4,5,6,8,9,10];
    const feltGreen = "#1a5c2a";
    const cellBorder = "1px solid #2d8a4688";

    return (
      <div style={{...pnl_,padding:0,overflow:"hidden"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",color:"#666",padding:"8px 12px 4px"}}>TABLE VIEW</div>

        <div style={{background:feltGreen,padding:8,borderRadius:"0 0 8px 8px",position:"relative"}}>

          <div style={{display:"flex",alignItems:"center",padding:"4px 6px",borderRadius:"6px 6px 0 0",border:cellBorder,borderBottom:"none",background:"rgba(0,0,0,.15)",marginBottom:0}}>
            <div style={{flex:1,fontSize:9,fontWeight:600,color:"#ccc",letterSpacing:".05em"}}>DON'T PASS BAR</div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <Chip amount={bets.dontPass} color="#f44336" small />
              {bets.dontPassOdds > 0 && <Chip amount={bets.dontPassOdds} color="#00e676" small />}
            </div>
          </div>

          <div style={{display:"flex",border:cellBorder,borderBottom:"none"}}>
            {placeNums.map(num=>{
              const isPoint = point === num;
              const hasPlace = bets[`place${num}`] > 0;
              const hasCome = !!comeByNum[num];
              const hasDc = !!dcByNum[num];
              return (
                <div key={num} style={{
                  flex:1, padding:"6px 2px", textAlign:"center",
                  borderRight:num!==10?cellBorder:"none",
                  background:isPoint?"rgba(255,255,255,.08)":"transparent",
                  position:"relative", minHeight:48,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2,
                }}>
                  <div style={{fontSize:14,fontWeight:800,color:isPoint?"#fff":"#ffffffbb",fontFamily:mono}}>{num===6?"SIX":num===8?"EIGHT":num}</div>
                  {isPoint && <div style={{position:"absolute",top:2,right:2}}><Puck on={true} /></div>}
                  <div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center"}}>
                    {hasPlace && <Chip amount={bets[`place${num}`]} color="#ffc107" small />}
                    {hasCome && (
                      <div style={{position:"relative"}}>
                        <Chip amount={comeByNum[num].amount} color="#4caf50" small />
                        <OddsChip amount={comeByNum[num].odds} />
                      </div>
                    )}
                    {hasDc && (
                      <div style={{position:"relative"}}>
                        <Chip amount={dcByNum[num].amount} color="#f44336" small />
                        <OddsChip amount={dcByNum[num].odds} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{display:"flex",border:cellBorder,borderBottom:"none"}}>
            <div style={{flex:2,padding:"5px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",borderRight:cellBorder}}>
              <span style={{fontSize:9,fontWeight:600,color:"#ccc"}}>COME</span>
              <Chip amount={bets.come} color="#4caf50" small />
            </div>
            <div style={{flex:1,padding:"5px 6px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:8,fontWeight:600,color:"#ccc"}}>DC</span>
              <Chip amount={bets.dontCome} color="#f44336" small />
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 6px",border:cellBorder,borderBottom:"none",background:"rgba(0,0,0,.1)"}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:9,fontWeight:700,color:"#ccc"}}>FIELD</span>
              <span style={{fontSize:7,color:"#ffffff88"}}>2·3·4·9·10·11·12</span>
            </div>
            <Chip amount={bets.field} color="#8bc34a" small />
          </div>

          <div style={{border:cellBorder,borderBottom:"none",padding:"4px 6px",background:"rgba(0,0,0,.2)"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
              {[
                {label:"Hard 4",k:"hardway4"},{label:"Hard 6",k:"hardway6"},
                {label:"Hard 8",k:"hardway8"},{label:"Hard 10",k:"hardway10"},
                {label:"Any 7",k:"any7"},{label:"Any Cr",k:"anyCraps"},
                {label:"Yo",k:"yo"},{label:"12",k:"boxcars"},{label:"2",k:"aces"},{label:"Horn",k:"horn"},{label:"C&E",k:"ce"},{label:"Buy 4",k:"buy4"},{label:"Buy 10",k:"buy10"},
              ].map(p=>{
                const amt = bets[p.k];
                if (!amt || amt <= 0) return null;
                return (
                  <div key={p.k} style={{display:"flex",alignItems:"center",gap:3,padding:"2px 5px",borderRadius:4,background:"rgba(255,255,255,.06)"}}>
                    <span style={{fontSize:8,color:"#aaa"}}>{p.label}</span>
                    <Chip amount={amt} color={p.k.includes("hard")?"#e040fb":"#ff5722"} small />
                  </div>
                );
              })}
              {!["hardway4","hardway6","hardway8","hardway10","any7","anyCraps","yo","boxcars","aces","horn","ce","buy4","buy10"].some(k=>bets[k]>0) && (
                <span style={{fontSize:8,color:"#ffffff44",fontStyle:"italic"}}>center bets</span>
              )}
            </div>
          </div>

          {(allSmallBet > 0 || allTallBet > 0 || allNumbersBet > 0) && (
            <div style={{border:cellBorder,borderBottom:"none",padding:"4px 6px",background:"rgba(0,0,0,.15)"}}>
              <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap"}}>
                {allSmallBet>0&&<span style={{fontSize:8,padding:"2px 6px",borderRadius:3,background:"rgba(255,152,0,.15)",color:"#ff9800",fontFamily:mono,fontWeight:600}}>SMALL ${allSmallBet} ({allSmallHits.length}/5)</span>}
                {allTallBet>0&&<span style={{fontSize:8,padding:"2px 6px",borderRadius:3,background:"rgba(255,152,0,.15)",color:"#ff9800",fontFamily:mono,fontWeight:600}}>TALL ${allTallBet} ({allTallHits.length}/5)</span>}
                {allNumbersBet>0&&<span style={{fontSize:8,padding:"2px 6px",borderRadius:3,background:"rgba(255,152,0,.15)",color:"#ff9800",fontFamily:mono,fontWeight:600}}>ALL ${allNumbersBet} ({allNumbersHits.length}/10)</span>}
              </div>
            </div>
          )}

          <div style={{display:"flex",alignItems:"center",padding:"6px 6px",borderRadius:"0 0 4px 4px",border:cellBorder,background:"rgba(0,0,0,.1)"}}>
            <div style={{flex:1,fontSize:10,fontWeight:700,color:"#fff",letterSpacing:".05em"}}>PASS LINE</div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {phase==="comeout"&&!point&&<Puck on={false} />}
              <div style={{position:"relative"}}>
                <Chip amount={bets.pass} color="#4caf50" />
                {bets.passOdds > 0 && <OddsChip amount={bets.passOdds} />}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const RollBtn = ()=>{
    const disabled = rolling || totalBets === 0;
    const isBotActive = isBotShooter && autoRolling && !shooterPaused;
    return (
      <button onClick={handleRollButton} disabled={disabled} style={{
        padding:isDesktop?"14px 40px":"12px 32px", borderRadius:10, fontSize:isDesktop?16:15, fontWeight:700,
        background:disabled?"#2a2a3a":isBotShooter?(isBotActive?"linear-gradient(135deg,#7b1fa2,#9c27b0)":"linear-gradient(135deg,#6a1b9a,#8e24aa)"):"linear-gradient(135deg,#2e7d32,#4caf50)",
        color:disabled?"#555":"#fff", border:"none",
        cursor:disabled?"not-allowed":"pointer", letterSpacing:".05em",
        boxShadow:disabled?"none":isBotShooter?"0 4px 20px rgba(156,39,176,.35)":"0 4px 20px rgba(76,175,80,.3)",
        animation:!disabled&&!isBotActive?(isBotShooter?"pulsePurple 2s infinite":"pulseGreen 2s infinite"):"none",
        transition:"all .3s", whiteSpace:"nowrap",
      }}>{rollBtnLabel()}</button>
    );
  };

  const DiceArea = ()=>(
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:isDesktop?"32px 16px 24px":"24px 16px 16px", background:"radial-gradient(ellipse at center,rgba(30,60,30,.3) 0%,transparent 70%)" }}>
      <div style={{display:"flex",gap:isDesktop?20:16,marginBottom:16}}>
        <Die value={die1} rolling={rolling} size={isDesktop?92:72} />
        <Die value={die2} rolling={rolling} delay={.08} size={isDesktop?92:72} />
      </div>
      <div style={{fontSize:13,color:"#888",fontFamily:mono,marginBottom:8}}>
        Total: <span style={{color:"#fff",fontWeight:700,fontSize:isDesktop?24:18}}>{die1+die2}</span>
      </div>
      {rotationEnabled && <div style={{marginBottom:12}}><ShooterTag /></div>}
      <ComePointPills />
      <RollBtn />
      {log.length > 0 && (
        <div style={{marginTop:12,padding:"6px 14px",borderRadius:6,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.04)",maxWidth:isDesktop?480:360,textAlign:"center",animation:"fadeIn .3s ease-out"}}>
          <div style={{fontSize:11,fontFamily:mono,lineHeight:1.4,
            color:log[log.length-1].type==="win"?"#4caf50":log[log.length-1].type==="lose"?"#f44336":log[log.length-1].type==="point"?"#ff9800":"#777",
          }}>{log[log.length-1].msg}</div>
        </div>
      )}
    </div>
  );

  const BetPanel = ()=>(
    <div>
      <div style={{display:"flex",background:"#12121f",borderRadius:"8px 8px 0 0",border:"1px solid rgba(255,255,255,.06)",borderBottom:"none",overflow:"hidden"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 0",fontSize:11,fontWeight:600,background:tab===t.id?"rgba(76,175,80,.08)":"transparent",color:tab===t.id?"#4caf50":"#666",border:"none",cursor:"pointer",borderBottom:tab===t.id?"2px solid #4caf50":"2px solid transparent",letterSpacing:".05em",transition:"all .2s"}}>{t.label}</button>
        ))}
      </div>
      <div style={{...pnl_,borderRadius:"0 0 8px 8px",borderTop:"none",padding:"8px 12px",minHeight:120}}>
        {tab==="line"&&<>
          <BetButton label="Pass Line" he={HOUSE_EDGES.pass} amount={bets.pass} onBet={()=>placeBet("pass")} onRemove={()=>removeBet("pass")} disabled={phase==="point"&&bets.pass===0} />
          <BetButton label={`Pass Odds${point?` (${bets.passOdds}/${getMaxOddsAmt(bets.pass,point)})`:""}`} he={HOUSE_EDGES.odds} amount={bets.passOdds} onBet={()=>placeBet("passOdds")} onRemove={()=>removeBet("passOdds")} disabled={bets.pass===0||phase==="comeout"||(point&&bets.passOdds>=getMaxOddsAmt(bets.pass,point))} />
          <BetButton label="Don't Pass" he={HOUSE_EDGES.dontPass} amount={bets.dontPass} onBet={()=>placeBet("dontPass")} onRemove={()=>removeBet("dontPass")} disabled={phase==="point"&&bets.dontPass===0} />
          <BetButton label={`DP Odds${point?` (${bets.dontPassOdds}/${getMaxOddsAmt(bets.dontPass,point)})`:""}`} he={HOUSE_EDGES.odds} amount={bets.dontPassOdds} onBet={()=>placeBet("dontPassOdds")} onRemove={()=>removeBet("dontPassOdds")} disabled={bets.dontPass===0||phase==="comeout"||(point&&bets.dontPassOdds>=getMaxOddsAmt(bets.dontPass,point))} />
          <div style={{height:8}} />
          <BetButton label="Come" he={HOUSE_EDGES.come} amount={bets.come} onBet={()=>placeBet("come")} onRemove={()=>removeBet("come")} disabled={phase==="comeout"} />
          <BetButton label="Don't Come" he={HOUSE_EDGES.dontCome} amount={bets.dontCome} onBet={()=>placeBet("dontCome")} onRemove={()=>removeBet("dontCome")} disabled={phase==="comeout"} />
          {(comePoints.length>0||dontComePoints.length>0)&&<div style={{fontSize:10,color:"#555",marginTop:4,fontStyle:"italic"}}>Manage come/DC odds in Active Bets below ↓</div>}
        </>}
        {tab==="place"&&<>
          <BetButton label="Place 6" he={HOUSE_EDGES.place6} amount={bets.place6} onBet={()=>placeBet("place6")} onRemove={()=>removeBet("place6")} disabled={phase==="comeout"} />
          <BetButton label="Place 8" he={HOUSE_EDGES.place8} amount={bets.place8} onBet={()=>placeBet("place8")} onRemove={()=>removeBet("place8")} disabled={phase==="comeout"} />
          <BetButton label="Place 5" he={HOUSE_EDGES.place5} amount={bets.place5} onBet={()=>placeBet("place5")} onRemove={()=>removeBet("place5")} disabled={phase==="comeout"} />
          <BetButton label="Place 9" he={HOUSE_EDGES.place9} amount={bets.place9} onBet={()=>placeBet("place9")} onRemove={()=>removeBet("place9")} disabled={phase==="comeout"} />
          <BetButton label="Place 4" he={HOUSE_EDGES.place4} amount={bets.place4} onBet={()=>placeBet("place4")} onRemove={()=>removeBet("place4")} disabled={phase==="comeout"} />
          <BetButton label="Place 10" he={HOUSE_EDGES.place10} amount={bets.place10} onBet={()=>placeBet("place10")} onRemove={()=>removeBet("place10")} disabled={phase==="comeout"} />
          <div style={{height:8}} />
          <div style={{fontSize:10,color:"#555",letterSpacing:".1em",fontWeight:600,marginBottom:4}}>BUY BETS (true odds - 5% vig)</div>
          <BetButton label="Buy 4" he={HOUSE_EDGES.buy4} amount={bets.buy4} onBet={()=>placeBet("buy4")} onRemove={()=>removeBet("buy4")} disabled={phase==="comeout"} />
          <BetButton label="Buy 10" he={HOUSE_EDGES.buy10} amount={bets.buy10} onBet={()=>placeBet("buy10")} onRemove={()=>removeBet("buy10")} disabled={phase==="comeout"} />
          <div style={{fontSize:11,color:"#555",marginTop:8,fontStyle:"italic"}}>Place 6/8 use $6 increments. Buy 4/10 beats Place 4/10 (4.76% vs 6.67%).</div>
        </>}
        {tab==="props"&&<>
          <BetButton label="Field" he={HOUSE_EDGES.field} amount={bets.field} onBet={()=>placeBet("field")} onRemove={()=>removeBet("field")} />
          <div style={{height:4}} />
          <div style={{fontSize:10,color:"#555",letterSpacing:".1em",fontWeight:600,marginBottom:4}}>ONE-ROLL PROPS</div>
          <BetButton label="Any 7" he={HOUSE_EDGES.any7} amount={bets.any7} onBet={()=>placeBet("any7")} onRemove={()=>removeBet("any7")} mini />
          <BetButton label="Any Craps" he={HOUSE_EDGES.anyCraps} amount={bets.anyCraps} onBet={()=>placeBet("anyCraps")} onRemove={()=>removeBet("anyCraps")} mini />
          <BetButton label="Yo (11)" he={HOUSE_EDGES.yo} amount={bets.yo} onBet={()=>placeBet("yo")} onRemove={()=>removeBet("yo")} mini />
          <BetButton label="Boxcars (12)" he={HOUSE_EDGES.boxcars} amount={bets.boxcars} onBet={()=>placeBet("boxcars")} onRemove={()=>removeBet("boxcars")} mini />
          <BetButton label="Horn ($4)" he={HOUSE_EDGES.horn} amount={bets.horn} onBet={()=>placeBet("horn")} onRemove={()=>removeBet("horn")} mini />
          <BetButton label="C&E" he={HOUSE_EDGES.ce} amount={bets.ce} onBet={()=>placeBet("ce")} onRemove={()=>removeBet("ce")} mini />
          <BetButton label="Aces (2)" he={HOUSE_EDGES.aces} amount={bets.aces} onBet={()=>placeBet("aces")} onRemove={()=>removeBet("aces")} mini />
        </>}
        {tab==="bonus"&&<>
          <BetButton label="Hard 6" he={HOUSE_EDGES.hardway6} amount={bets.hardway6} onBet={()=>placeBet("hardway6")} onRemove={()=>removeBet("hardway6")} />
          <BetButton label="Hard 8" he={HOUSE_EDGES.hardway8} amount={bets.hardway8} onBet={()=>placeBet("hardway8")} onRemove={()=>removeBet("hardway8")} />
          <BetButton label="Hard 4" he={HOUSE_EDGES.hardway4} amount={bets.hardway4} onBet={()=>placeBet("hardway4")} onRemove={()=>removeBet("hardway4")} />
          <BetButton label="Hard 10" he={HOUSE_EDGES.hardway10} amount={bets.hardway10} onBet={()=>placeBet("hardway10")} onRemove={()=>removeBet("hardway10")} />
          <div style={{height:8}} />
          <div style={{fontSize:10,color:"#555",letterSpacing:".1em",fontWeight:600,marginBottom:4}}>ALL BETS (multi-roll, lose on 7)</div>
          {[
            {label:"All Small",bet:allSmallBet,setBet:setAllSmallBet,hits:allSmallHits,setHits:setAllSmallHits,need:"2,3,4,5,6",max:5,pay:"34:1",he:HOUSE_EDGES.allSmall},
            {label:"All Tall",bet:allTallBet,setBet:setAllTallBet,hits:allTallHits,setHits:setAllTallHits,need:"8,9,10,11,12",max:5,pay:"34:1",he:HOUSE_EDGES.allTall},
            {label:"All Numbers",bet:allNumbersBet,setBet:setAllNumbersBet,hits:allNumbersHits,setHits:setAllNumbersHits,need:"2-6,8-12",max:10,pay:"175:1",he:HOUSE_EDGES.allNumbers},
          ].map(ab=>(
            <div key={ab.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:ab.bet>0?"#e0e0e0":"#888"}}>{ab.label} {ab.bet>0&&<span style={{color:"#ff9800",fontWeight:600}}>${ab.bet}</span>} <Badge he={ab.he} /></div>
                <div style={{fontSize:9,color:"#555"}}>{ab.hits.length>0?("Hit: "+ab.hits.slice().sort((a,b)=>a-b).join(",")+` (${ab.hits.length}/${ab.max})`):"Need: "+ab.need+" | Pays "+ab.pay}</div>
              </div>
              <div style={{display:"flex",gap:3}}>
                <button onClick={()=>{if(bankroll>=5){ab.setBet(ab.bet+5);setBankroll(b=>b-5)}}} disabled={bankroll<5} style={{padding:"3px 8px",fontSize:10,borderRadius:4,background:bankroll<5?"#333":"rgba(76,175,80,0.2)",color:bankroll<5?"#555":"#4caf50",border:"1px solid "+(bankroll<5?"#444":"rgba(76,175,80,0.3)"),cursor:bankroll<5?"not-allowed":"pointer",fontWeight:600}}>+$5</button>
                {ab.bet>0&&<button onClick={()=>{setBankroll(b=>b+ab.bet);ab.setBet(0);ab.setHits([])}} style={{padding:"3px 8px",fontSize:10,borderRadius:4,background:"rgba(244,67,54,0.15)",color:"#f44336",border:"1px solid rgba(244,67,54,0.3)",cursor:"pointer",fontWeight:600}}>X</button>}
              </div>
            </div>
          ))}
          <div style={{fontSize:11,color:"#555",marginTop:8,fontStyle:"italic"}}>Hardways 9-11% edge. All bets lose on any 7.</div>
        </>}
      </div>
    </div>
  );

  const CoachPanel = ()=>(
    <div style={{...pnl_,border:`1px solid ${coachAdvice&&!coachLoading?"rgba(76,175,80,.15)":"rgba(255,255,255,.06)"}`,transition:"border-color .3s"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:coachAdvice||coachLoading?"1px solid rgba(255,255,255,.04)":"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>{coachLoading?"⏳":"🧠"}</span>
          <span style={{fontSize:12,fontWeight:700,color:"#e0e0e0",letterSpacing:".05em"}}>INSTINCT COACH</span>
          {coachLoading&&<span style={{fontSize:10,color:"#4caf50",fontWeight:600}}>working…</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>{setCoachAdvice(null);askCoach(buildSnapshot())}} disabled={coachLoading} style={{padding:"3px 10px",fontSize:10,borderRadius:4,background:"rgba(76,175,80,.12)",color:"#4caf50",border:"1px solid rgba(76,175,80,.25)",cursor:coachLoading?"wait":"pointer",fontWeight:600,letterSpacing:".05em"}}>ASK</button>
          <button onClick={()=>setCoachEnabled(!coachEnabled)} style={{padding:"3px 8px",fontSize:10,borderRadius:4,background:coachEnabled?"rgba(76,175,80,.1)":"rgba(255,255,255,.03)",color:coachEnabled?"#4caf50":"#555",border:`1px solid ${coachEnabled?"rgba(76,175,80,.2)":"rgba(255,255,255,.06)"}`,cursor:"pointer",fontWeight:600}}>{coachEnabled?"AUTO":"OFF"}</button>
        </div>
      </div>
      {coachLoading&&<div style={{padding:"12px 14px",textAlign:"center"}}><div style={{fontSize:12,color:"#4caf50"}}>Analyzing your table…</div></div>}
      {coachAdvice&&!coachLoading&&(
        <div style={{padding:"12px 14px",animation:"fadeIn .4s ease-out"}}>
          {coachAdvice.instinct&&<div style={{marginBottom:10,padding:"10px 12px",borderRadius:8,background:"rgba(255,152,0,.08)",border:"1px solid rgba(255,152,0,.15)"}}>
            <div style={{fontSize:9,fontWeight:700,color:"#ff9800",letterSpacing:".15em",marginBottom:5}}>🎯 BUILD THIS INSTINCT</div>
            <div style={{fontSize:13,fontWeight:600,color:"#fff",lineHeight:1.5}}>{coachAdvice.instinct}</div>
            {coachAdvice.why&&<div style={{fontSize:11,color:"#999",lineHeight:1.4,marginTop:6,paddingTop:6,borderTop:"1px solid rgba(255,255,255,.04)"}}><span style={{color:"#ff9800",fontWeight:600}}>Why: </span>{coachAdvice.why}</div>}
          </div>}
          {coachAdvice.action&&<div style={{fontSize:12,color:"#ccc",lineHeight:1.6,marginBottom:8,padding:"8px 10px",background:"rgba(76,175,80,.06)",borderRadius:6,borderLeft:"3px solid #4caf50"}}>
            <span style={{fontSize:9,fontWeight:700,color:"#4caf50",letterSpacing:".1em",display:"block",marginBottom:3}}>RIGHT NOW</span>
            {coachAdvice.action}
          </div>}
          <div style={{display:"flex",gap:8,marginBottom:coachAdvice.warnings&&coachAdvice.warnings!=="null"?8:0}}>
            <div style={{flex:1,padding:"5px 8px",borderRadius:6,background:coachAdvice.risk==="low"?"rgba(76,175,80,.08)":coachAdvice.risk==="medium"?"rgba(255,193,7,.08)":coachAdvice.risk==="high"?"rgba(255,152,0,.08)":"rgba(244,67,54,.08)"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",color:coachAdvice.risk==="low"?"#4caf50":coachAdvice.risk==="medium"?"#ffc107":coachAdvice.risk==="high"?"#ff9800":"#f44336"}}>RISK: {coachAdvice.risk?.toUpperCase()}</div>
              <div style={{fontSize:10,color:"#888",lineHeight:1.3,marginTop:2}}>{coachAdvice.risk_note}</div>
            </div>
          </div>
          {coachAdvice.warnings&&coachAdvice.warnings!=="null"&&<div style={{fontSize:11,color:"#ff9800",lineHeight:1.4,padding:"6px 8px",borderRadius:6,background:"rgba(255,152,0,.06)",borderLeft:"3px solid rgba(255,152,0,.3)"}}><span style={{fontSize:10,fontWeight:700}}>⚠️ </span>{coachAdvice.warnings}</div>}
        </div>
      )}
      {!coachAdvice&&!coachLoading&&<div style={{padding:"14px",textAlign:"center"}}><div style={{fontSize:12,color:"#444",fontStyle:"italic"}}>Roll the dice — coach builds your instincts after each roll</div></div>}
    </div>
  );

  const RollLog = ({height=160})=>(
    <div ref={logRef} style={{background:"#0d0d18",borderRadius:8,padding:10,border:"1px solid rgba(255,255,255,.04)",height,overflowY:"auto"}}>
      {log.length===0 ? <div style={{color:"#444",fontSize:12,textAlign:"center",paddingTop:20,fontStyle:"italic"}}>Place your bets and roll the dice…</div>
       : [...log].reverse().map(e=>(
          <div key={e.id} style={{fontSize:11,padding:"3px 0",color:e.type==="win"?"#4caf50":e.type==="lose"?"#f44336":e.type==="point"?"#ff9800":"#777",fontFamily:mono,animation:"fadeIn .3s ease-out",borderBottom:"1px solid rgba(255,255,255,.02)"}}>{e.msg}</div>
        ))}
    </div>
  );

  const StrategyRef = ()=>(
    <div>
      <button onClick={()=>setShowStrategy(!showStrategy)} style={{width:"100%",padding:"10px 12px",borderRadius:8,...pnl_,color:"#888",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>📊 Strategy Quick Ref</span><span style={{fontSize:10}}>{showStrategy?"▲":"▼"}</span>
      </button>
      {showStrategy&&<div style={{...pnl_,borderRadius:"0 0 8px 8px",borderTop:"none",padding:12,fontSize:12,lineHeight:1.7,color:"#999"}}>
        <div style={{color:"#4caf50",fontWeight:600,marginBottom:4}}>THE SMART PLAY</div>
        <div>Pass/Come + max odds = lowest house edge.</div>
        <div>Place 6 & 8 = best place bets (1.52%).</div>
        <div style={{color:"#ffc107",fontWeight:600,marginTop:8,marginBottom:4}}>THE OKAY PLAY</div>
        <div>Field = 5.56%. Place 5/9 = 4%.</div>
        <div style={{color:"#f44336",fontWeight:600,marginTop:8,marginBottom:4}}>THE SUCKER PLAY</div>
        <div>Props, hardways = casino's rent money.</div>
        <div>Any 7 at 16.67% is the worst bet on the table.</div>
      </div>}
    </div>
  );

  const riskTotal_ = totalBets + comePoints.reduce((s,c)=>s+c.amount+c.odds,0) + dontComePoints.reduce((s,d)=>s+d.amount+d.odds,0);
  const bankrollPct = startingBankroll > 0 ? Math.round((bankroll / startingBankroll) * 100) : 100;
  const exposurePct = bankroll > 0 ? Math.round((riskTotal_ / bankroll) * 100) : 0;

  const getZone = () => {
    if (bankrollPct <= 30) return { zone: "STOP", color: "#f44336", bg: "rgba(244,67,54,.12)", border: "rgba(244,67,54,.3)", msg: "Below 30% — stop-loss territory. Walk or grind." };
    if (bankrollPct <= 50) return { zone: "DANGER", color: "#ff5722", bg: "rgba(255,87,34,.1)", border: "rgba(255,87,34,.25)", msg: "Below half. No new bets — let existing ones resolve." };
    if (exposurePct > 20) return { zone: "HOT", color: "#ff9800", bg: "rgba(255,152,0,.08)", border: "rgba(255,152,0,.2)", msg: `${exposurePct}% of bankroll at risk — one 7 hurts.` };
    if (bankrollPct >= 130) return { zone: "HOUSE $", color: "#00e676", bg: "rgba(0,230,118,.08)", border: "rgba(0,230,118,.2)", msg: "Playing with profit. Lock in your buy-in mentally." };
    return { zone: "GREEN", color: "#4caf50", bg: "rgba(76,175,80,.06)", border: "rgba(76,175,80,.15)", msg: "Comfortable. Stick to your strategy." };
  };

  const zoneInfo = getZone();

  const BankrollZone = ({compact}) => {
    if (compact) {
      const barPct = Math.min(bankrollPct, 150);
      const barColor = zoneInfo.zone === "STOP" ? "#f44336" : zoneInfo.zone === "DANGER" ? "#ff5722" : zoneInfo.zone === "HOT" ? "#ff9800" : zoneInfo.zone === "HOUSE $" ? "#00e676" : "#4caf50";
      return (
        <div style={{padding:"0 12px 6px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{flex:1,height:4,borderRadius:2,background:"rgba(255,255,255,.06)",overflow:"hidden",position:"relative"}}>
              <div style={{position:"absolute",left:"20%",top:0,bottom:0,width:1,background:"rgba(244,67,54,.4)"}} />
              <div style={{position:"absolute",left:"33%",top:0,bottom:0,width:1,background:"rgba(255,152,0,.3)"}} />
              <div style={{height:"100%",width:`${Math.min(barPct/1.5, 100)}%`,borderRadius:2,background:barColor,transition:"width .3s, background .3s"}} />
            </div>
            <span style={{fontSize:8,fontWeight:700,color:zoneInfo.color,fontFamily:mono,letterSpacing:".05em",whiteSpace:"nowrap"}}>{zoneInfo.zone}</span>
          </div>
        </div>
      );
    }

    return (
      <div style={{...pnl_,padding:"10px 12px",border:`1px solid ${zoneInfo.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",color:"#666"}}>BANKROLL ZONE</span>
          <span style={{fontSize:12,fontWeight:800,color:zoneInfo.color,fontFamily:mono}}>{zoneInfo.zone}</span>
        </div>
        <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden",position:"relative",marginBottom:8}}>
          <div style={{position:"absolute",left:"20%",top:0,bottom:0,width:1,background:"rgba(244,67,54,.5)"}} />
          <div style={{position:"absolute",left:"33.3%",top:0,bottom:0,width:1,background:"rgba(255,152,0,.4)"}} />
          <div style={{position:"absolute",left:"66.6%",top:0,bottom:0,width:1,background:"rgba(76,175,80,.3)"}} />
          <div style={{height:"100%",width:`${Math.min(bankrollPct/1.5, 100)}%`,borderRadius:4,background:`linear-gradient(90deg, ${zoneInfo.color}cc, ${zoneInfo.color})`,transition:"width .3s"}} />
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:6}}>
          <span style={{color:"#888"}}>Bankroll: <span style={{color:zoneInfo.color,fontWeight:600,fontFamily:mono}}>{bankrollPct}%</span> of buy-in</span>
          <span style={{color:"#888"}}>Exposure: <span style={{color:exposurePct>20?"#ff9800":"#888",fontWeight:600,fontFamily:mono}}>{exposurePct}%</span></span>
        </div>
        <div style={{fontSize:11,color:zoneInfo.color,lineHeight:1.3}}>{zoneInfo.msg}</div>
      </div>
    );
  };

  const BetEfficiency = () => {
    const allRisk = [];
    Object.entries(bets).forEach(([k,v]) => { if (v > 0) allRisk.push({key:k, amt:v, cat:classifyBet(k)}); });
    comePoints.forEach(cp => {
      allRisk.push({key:`come_${cp.number}`, amt:cp.amount, cat:"smart"});
      if (cp.odds > 0) allRisk.push({key:`comeOdds_${cp.number}`, amt:cp.odds, cat:"smart"});
    });
    dontComePoints.forEach(dp => {
      allRisk.push({key:`dc_${dp.number}`, amt:dp.amount, cat:"smart"});
      if (dp.odds > 0) allRisk.push({key:`dcOdds_${dp.number}`, amt:dp.odds, cat:"smart"});
    });
    const smartAmt = allRisk.filter(r=>r.cat==="smart").reduce((s,r)=>s+r.amt,0);
    const okAmt = allRisk.filter(r=>r.cat==="ok").reduce((s,r)=>s+r.amt,0);
    const trashAmt = allRisk.filter(r=>r.cat==="trash").reduce((s,r)=>s+r.amt,0);
    const totalRisk = smartAmt + okAmt + trashAmt;
    if (totalRisk === 0) return null;

    const smartPct = Math.round(smartAmt/totalRisk*100);
    const okPct = Math.round(okAmt/totalRisk*100);
    const trashPct = 100 - smartPct - okPct;
    const grade = trashPct === 0 && smartPct >= 80 ? "A" : trashPct === 0 ? "B+" : trashPct <= 15 ? "B" : trashPct <= 30 ? "C" : trashPct <= 50 ? "D" : "F";
    const gradeColor = grade.startsWith("A")?"#4caf50":grade.startsWith("B")?"#8bc34a":grade==="C"?"#ffc107":grade==="D"?"#ff9800":"#f44336";

    return (
      <div style={{...pnl_,padding:"10px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",color:"#666"}}>BET EFFICIENCY</span>
          <span style={{fontSize:16,fontWeight:800,color:gradeColor,fontFamily:mono}}>{grade}</span>
        </div>
        <div style={{display:"flex",height:10,borderRadius:5,overflow:"hidden",marginBottom:8}}>
          {smartPct>0&&<div style={{width:`${smartPct}%`,background:"#4caf50",transition:"width .3s"}} />}
          {okPct>0&&<div style={{width:`${okPct}%`,background:"#ffc107",transition:"width .3s"}} />}
          {trashPct>0&&<div style={{width:`${trashPct}%`,background:"#f44336",transition:"width .3s"}} />}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontFamily:mono}}>
          <span style={{color:"#4caf50"}}>Smart ${smartAmt} ({smartPct}%)</span>
          {okAmt>0&&<span style={{color:"#ffc107"}}>OK ${okAmt} ({okPct}%)</span>}
          {trashAmt>0&&<span style={{color:"#f44336"}}>Trash ${trashAmt} ({trashPct}%)</span>}
        </div>
      </div>
    );
  };

  const SessionScorecard = () => {
    if (!showScorecard) return null;
    const t = betTracker.current;
    const duration = Math.round((Date.now() - sessionStartRef.current) / 60000);
    const netResult = bankroll - startingBankroll;
    const totalBetsMade = t.total;
    const disciplinePct = totalBetsMade > 0 ? Math.round((t.onStrat / totalBetsMade) * 100) : 100;
    const smartPct = totalBetsMade > 0 ? Math.round((t.smart / totalBetsMade) * 100) : 0;
    const trashPct = totalBetsMade > 0 ? Math.round((t.trash / totalBetsMade) * 100) : 0;

    const grade = disciplinePct >= 90 && trashPct <= 5 ? "A" : disciplinePct >= 80 && trashPct <= 10 ? "B+" : disciplinePct >= 70 && trashPct <= 20 ? "B" : disciplinePct >= 50 ? "C" : "D";
    const gradeColor = grade.startsWith("A")?"#4caf50":grade.startsWith("B")?"#8bc34a":grade==="C"?"#ffc107":"#ff9800";

    let leak = "None — clean session.";
    if (t.trash > 0 && t.trashAmt > t.okAmt) leak = `Prop/hardway bets: ${t.trash} bets totaling $${t.trashAmt} in high-edge territory.`;
    else if (t.offStrat > t.total * 0.3 && activeStrategy) leak = `Went off-strategy ${t.offStrat} times — the system only works if you follow it.`;
    else if (t.ok > t.smart) leak = `More "okay" bets than smart ones — tighten up to Pass/Come + odds.`;
    else if (t.trash > 0) leak = `${t.trash} trash bet${t.trash>1?"s":""} ($${t.trashAmt}) — that's the casino's margin.`;

    const StatRow = ({label,value,color="#e0e0e0"}) => (
      <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
        <span style={{fontSize:12,color:"#888"}}>{label}</span>
        <span style={{fontSize:12,fontWeight:600,color,fontFamily:mono}}>{value}</span>
      </div>
    );

    return (
      <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.8)",padding:20}}>
        <div style={{width:"100%",maxWidth:420,...pnl_,padding:0,animation:"fadeIn .4s ease-out",maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{padding:"20px 20px 12px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{fontSize:48,fontWeight:800,color:gradeColor,fontFamily:mono,lineHeight:1}}>{grade}</div>
            <div style={{fontSize:11,color:"#666",fontWeight:600,letterSpacing:".1em",marginTop:4}}>SESSION GRADE</div>
          </div>

          <div style={{padding:"16px 20px"}}>
            <div style={{textAlign:"center",marginBottom:16,padding:"12px",borderRadius:8,background:netResult>=0?"rgba(76,175,80,.08)":"rgba(244,67,54,.08)"}}>
              <div style={{fontSize:10,color:"#666",fontWeight:600,letterSpacing:".1em"}}>SESSION RESULT</div>
              <div style={{fontSize:28,fontWeight:800,color:netResult>=0?"#4caf50":"#f44336",fontFamily:mono}}>{netResult>=0?"+":""}{netResult}</div>
              <div style={{fontSize:11,color:"#888"}}>${startingBankroll} → ${bankroll}</div>
            </div>

            <StatRow label="Duration" value={`${duration} min`} />
            <StatRow label="Rolls" value={rollCount} />
            <StatRow label="Total bets placed" value={totalBetsMade} />
            <StatRow label="Won" value={`$${sessionWins}`} color="#4caf50" />
            <StatRow label="Lost" value={`$${sessionLosses}`} color="#f44336" />
            <StatRow label="Peak bankroll" value={`$${t.peak}`} color="#4caf50" />
            <StatRow label="Lowest bankroll" value={`$${t.trough}`} color="#ff9800" />
            <StatRow label="Strategy" value={activeStrategy?activeStrategy.charAt(0).toUpperCase()+activeStrategy.slice(1):"Freestyle"} />

            <div style={{marginTop:12,marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",color:"#666",marginBottom:6}}>DISCIPLINE</div>
              {activeStrategy && <StatRow label="On-strategy bets" value={`${disciplinePct}%`} color={disciplinePct>=80?"#4caf50":disciplinePct>=60?"#ffc107":"#f44336"} />}
              <StatRow label="Smart bets (≤1.5%)" value={`${t.smart} ($${t.smartAmt})`} color="#4caf50" />
              <StatRow label="OK bets (≤5%)" value={`${t.ok} ($${t.okAmt})`} color="#ffc107" />
              <StatRow label="Trash bets (>5%)" value={`${t.trash} ($${t.trashAmt})`} color={t.trash>0?"#f44336":"#4caf50"} />

              {totalBetsMade > 0 && (
                <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginTop:8}}>
                  {smartPct>0&&<div style={{width:`${smartPct}%`,background:"#4caf50"}} />}
                  {(100-smartPct-trashPct)>0&&<div style={{width:`${100-smartPct-trashPct}%`,background:"#ffc107"}} />}
                  {trashPct>0&&<div style={{width:`${trashPct}%`,background:"#f44336"}} />}
                </div>
              )}
            </div>

            <div style={{padding:"10px 12px",borderRadius:6,background:"rgba(255,152,0,.06)",borderLeft:"3px solid rgba(255,152,0,.3)",marginBottom:16}}>
              <div style={{fontSize:9,fontWeight:700,color:"#ff9800",letterSpacing:".1em",marginBottom:3}}>BIGGEST LEAK</div>
              <div style={{fontSize:12,color:"#ccc",lineHeight:1.4}}>{leak}</div>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setShowScorecard(false); setShowSetup(true);
                setBets(initialBets()); setPoint(null); setPhase("comeout"); setLog([]);
                setRollCount(0); setSessionWins(0); setSessionLosses(0);
                setComePoints([]); setDontComePoints([]); setBankroll(startingBankroll);
                setCoachAdvice(null); setLastRollNet(null);
                setAllSmallBet(0); setAllTallBet(0); setAllNumbersBet(0); setAllSmallHits([]); setAllTallHits([]); setAllNumbersHits([]);
                setCurrentShooterIdx(0); setAutoRolling(false); setShooterPaused(true);
                betTracker.current = {smart:0,ok:0,trash:0,smartAmt:0,okAmt:0,trashAmt:0,total:0,onStrat:0,offStrat:0,peak:startingBankroll,trough:startingBankroll};
                sessionStartRef.current = Date.now();
              }} style={{
                flex:1,padding:"12px",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",
                background:"linear-gradient(135deg,#2e7d32,#4caf50)",color:"#fff",border:"none",
              }}>New Session</button>
              <button onClick={()=>setShowScorecard(false)} style={{
                padding:"12px 20px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",
                background:"rgba(255,255,255,.05)",color:"#888",border:"1px solid rgba(255,255,255,.1)",
              }}>Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Footer = ()=>(
    <div style={{display:"flex",gap:8,justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>setShowScorecard(true)} style={{padding:"8px 14px",borderRadius:6,fontSize:11,fontWeight:600,background:"rgba(76,175,80,.1)",color:"#4caf50",border:"1px solid rgba(76,175,80,.2)",cursor:"pointer"}}>End Session</button>
        <button onClick={()=>{
          setBets(initialBets()); setPoint(null); setPhase("comeout"); setLog([]);
          setRollCount(0); setSessionWins(0); setSessionLosses(0);
          setComePoints([]); setDontComePoints([]); setBankroll(startingBankroll);
          setShowSetup(true); setCoachAdvice(null); setLastRollNet(null);
          setAllSmallBet(0); setAllTallBet(0); setAllNumbersBet(0); setAllSmallHits([]); setAllTallHits([]); setAllNumbersHits([]);
          setCurrentShooterIdx(0); setAutoRolling(false); setShooterPaused(true);
          betTracker.current = {smart:0,ok:0,trash:0,smartAmt:0,okAmt:0,trashAmt:0,total:0,onStrat:0,offStrat:0,peak:startingBankroll,trough:startingBankroll};
        }} style={{padding:"8px 12px",borderRadius:6,fontSize:11,fontWeight:600,background:"rgba(244,67,54,.08)",color:"#f44336",border:"1px solid rgba(244,67,54,.15)",cursor:"pointer"}}>Reset</button>
      </div>
      <div style={{fontSize:11,color:"#555",fontFamily:mono,display:"flex",alignItems:"center",gap:12}}>
        <span>Won: <span style={{color:"#4caf50"}}>${sessionWins}</span></span>
        <span>Lost: <span style={{color:"#f44336"}}>${sessionLosses}</span></span>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div style={{minHeight:"100vh",background:"#0a0a14",color:"#e0e0e0",fontFamily:"'DM Sans',sans-serif"}}>
        <style>{CSS}</style>
        <SessionScorecard />
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 24px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(10,10,20,.9)",backdropFilter:"blur(10px)",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:13,letterSpacing:".15em",color:"#4caf50",fontWeight:700}}>CRAPS TRAINER</span>
            <PhaseTag />
            {rotationEnabled && <ShooterTag />}
            <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:zoneInfo.bg,color:zoneInfo.color,fontWeight:700,fontFamily:mono,letterSpacing:".05em",border:`1px solid ${zoneInfo.border}`}}>{zoneInfo.zone}</span>
            <button onClick={()=>{const n=!rotationEnabled;setRotationEnabled(n);if(!n){setCurrentShooterIdx(0);setAutoRolling(false);setShooterPaused(true);if(autoRollTimerRef.current)clearTimeout(autoRollTimerRef.current);}}} title={rotationEnabled?"Shooter rotation ON":"Solo mode (you always shoot)"} style={{fontSize:14,background:"none",border:"none",cursor:"pointer",opacity:rotationEnabled?1:0.35,padding:0,lineHeight:1}}>👥</button>
            <button onClick={()=>setSoundEnabled(!soundEnabled)} style={{fontSize:16,background:"none",border:"none",cursor:"pointer",opacity:soundEnabled?1:0.3,padding:0,lineHeight:1}}>{soundEnabled?"🔊":"🔇"}</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:28}}>
            <Stat label="BANKROLL" value={`$${bankroll.toLocaleString()}`} />
            <Stat label="P&L" value={`${pnl>=0?"+":""}${pnl}`} color={pnl>=0?"#4caf50":"#f44336"} />
            <Stat label="ROLLS" value={rollCount} color="#888" />
            <Stat label="AT RISK" value={`$${totalBets}`} color="#ff9800" />
            {lastRollNet!==null&&rollCount>0&&<Stat label="LAST" value={`${lastRollNet>0?"+":""}${lastRollNet===0?"$0":`$${Math.abs(lastRollNet)}`}`} color={lastRollNet>0?"#4caf50":lastRollNet<0?"#f44336":"#666"} />}
          </div>
        </div>
        <div style={{display:"flex",height:"calc(100vh - 52px)",overflow:"hidden"}}>
          <div style={{width:320,minWidth:320,borderRight:"1px solid rgba(255,255,255,.06)",overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".15em",color:"#555"}}>BETS</div>
            <BankrollZone />
            <BetPanel />
            <StrategyGuide />
            <ActiveBets />
            <BetEfficiency />
            <StrategyRef />
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRight:"1px solid rgba(255,255,255,.06)",overflowY:"auto"}}>
            <DiceArea />
            <div style={{padding:"0 16px 12px",width:"100%",maxWidth:520}}><TableView /></div>
            <div style={{padding:"0 24px 16px",width:"100%",maxWidth:480}}><Footer /></div>
          </div>
          <div style={{width:380,minWidth:340,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".15em",color:"#555"}}>INTELLIGENCE</div>
            <CoachPanel />
            <ExposureMap />
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".15em",color:"#555",marginBottom:8}}>ROLL HISTORY</div>
              <RollLog height={280} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mTabs = [{id:"bets",label:"Bets"},{id:"position",label:"Position"},{id:"coach",label:"Coach"},{id:"more",label:"More"}];
  const lastEntry = log.length > 0 ? log[log.length - 1] : null;
  const riskTotal = totalBets + comePoints.reduce((s,c)=>s+c.amount+c.odds,0) + dontComePoints.reduce((s,d)=>s+d.amount+d.odds,0);

  return (
    <div style={{minHeight:"100vh",background:"#0a0a14",color:"#e0e0e0",fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{CSS}</style>
      <SessionScorecard />

      <div style={{position:"sticky",top:0,zIndex:10,background:"#0a0a14",borderBottom:"1px solid rgba(255,255,255,.06)"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"rgba(10,10,20,.95)"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <PhaseTag />
            {rotationEnabled && <ShooterTag compact />}
            <button onClick={()=>{const n=!rotationEnabled;setRotationEnabled(n);if(!n){setCurrentShooterIdx(0);setAutoRolling(false);setShooterPaused(true);if(autoRollTimerRef.current)clearTimeout(autoRollTimerRef.current);}}} style={{fontSize:12,background:"none",border:"none",cursor:"pointer",opacity:rotationEnabled?1:0.35,padding:0,lineHeight:1}}>👥</button>
            <button onClick={()=>setSoundEnabled(!soundEnabled)} style={{fontSize:14,background:"none",border:"none",cursor:"pointer",opacity:soundEnabled?1:0.3,padding:0,lineHeight:1}}>{soundEnabled?"🔊":"🔇"}</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"#666",fontWeight:700}}>BANK</div><div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:mono}}>${bankroll}</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"#666",fontWeight:700}}>P&L</div><div style={{fontSize:12,fontWeight:700,color:pnl>=0?"#4caf50":"#f44336",fontFamily:mono}}>{pnl>=0?"+":""}{pnl}</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"#666",fontWeight:700}}>RISK</div><div style={{fontSize:12,fontWeight:700,color:"#ff9800",fontFamily:mono}}>${riskTotal}</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"#666",fontWeight:700}}>#{rollCount}</div>
              {lastRollNet !== null && rollCount > 0 ? (
                <div style={{fontSize:12,fontWeight:700,fontFamily:mono,color:lastRollNet>0?"#4caf50":lastRollNet<0?"#f44336":"#666"}}>{lastRollNet>0?"+":""}{lastRollNet===0?"—":`$${Math.abs(lastRollNet)}`}</div>
              ) : <div style={{fontSize:12,color:"#444"}}>—</div>}
            </div>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"10px 12px 6px",background:"radial-gradient(ellipse at center,rgba(30,60,30,.2) 0%,transparent 70%)"}}>
          <Die value={die1} rolling={rolling} size={52} />
          <Die value={die2} rolling={rolling} delay={.08} size={52} />
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:32}}>
            <div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:mono,lineHeight:1}}>{die1+die2}</div>
          </div>
          <RollBtn />
        </div>

        <div style={{padding:"0 12px 8px"}}>
          <ComePointPills />
          {lastEntry && (
            <div style={{fontSize:10,fontFamily:mono,textAlign:"center",lineHeight:1.3,padding:"4px 8px",borderRadius:4,background:"rgba(255,255,255,.02)",
              color:lastEntry.type==="win"?"#4caf50":lastEntry.type==="lose"?"#f44336":lastEntry.type==="point"?"#ff9800":"#666",
            }}>{lastEntry.msg}</div>
          )}
        </div>
        <BankrollZone compact />
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.06)",background:"#0d0d18",flexShrink:0}}>
          {mTabs.map(t=>(
            <button key={t.id} onClick={()=>setMobileTab(t.id)} style={{
              flex:1,padding:"9px 0",fontSize:11,fontWeight:600,
              background:mobileTab===t.id?"rgba(76,175,80,.06)":"transparent",
              color:mobileTab===t.id?"#4caf50":"#666",border:"none",cursor:"pointer",
              borderBottom:mobileTab===t.id?"2px solid #4caf50":"2px solid transparent",
              transition:"all .15s",
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:10}}>
          {mobileTab==="bets"&&<>
            <BetPanel />
            <StrategyGuide />
          </>}
          {mobileTab==="position"&&<>
            <BankrollZone />
            <TableView />
            <ActiveBets />
            <BetEfficiency />
            <ExposureMap />
          </>}
          {mobileTab==="coach"&&<>
            <CoachPanel />
          </>}
          {mobileTab==="more"&&<>
            <RollLog height={200} />
            <StrategyRef />
            <Footer />
          </>}
        </div>
      </div>
    </div>
  );
}
