import { useState, useCallback, useRef, useEffect } from "react";
import {
  calcOutcome,
  classifyBet,
  getBetIncrement,
  getMaxOddsAmt,
  initialBets,
} from "./lib/betLogic.js";
import { isOnStrategy } from "./lib/strategies.js";
import { getLocalInstinct } from "./lib/coachEngine.js";
import { playDiceRoll, playWinSound, playLoseSound, playPointSetSound, playBigWinSound, speakCall } from "./lib/sounds.js";
import { SHOOTERS } from "./lib/shooters.js";
import { completeCrapsRoll } from "./lib/completeCrapsRoll.js";
import SetupScreen from "./components/SetupScreen.jsx";
import ActiveBets from "./components/ActiveBets.jsx";
import BetPanel from "./components/BetPanel.jsx";
import StrategyGuide from "./components/StrategyGuide.jsx";
import ExposureMap from "./components/ExposureMap.jsx";
import TableView from "./components/TableView.jsx";
import CoachPanel from "./components/CoachPanel.jsx";
import RollLog from "./components/RollLog.jsx";
import BankrollZone from "./components/BankrollZone.jsx";
import BetEfficiency from "./components/BetEfficiency.jsx";
import SessionScorecard from "./components/SessionScorecard.jsx";
import Footer from "./components/Footer.jsx";
import DiceArea from "./components/DiceArea.jsx";
import Die from "./components/Die.jsx";
import useWindowWidth from "./hooks/useWindowWidth.js";
import PhaseTag from "./components/PhaseTag.jsx";
import ShooterTag from "./components/ShooterTag.jsx";
import TrainerStat from "./components/TrainerStat.jsx";
import ComePointPills from "./components/ComePointPills.jsx";
import StrategyQuickRef from "./components/StrategyQuickRef.jsx";
import GameRollButton from "./components/GameRollButton.jsx";

export default function CrapsTrainer() {
  const winWidth = useWindowWidth();
  const isDesktop = winWidth >= 860;

  const [bankroll, setBankroll] = useState(500);
  const [startingBankroll, setStartingBankroll] = useState(500);
  const [betUnit, setBetUnit] = useState(10);
  const [tableMin, setTableMin] = useState(10);
  const [buyVigPolicy, setBuyVigPolicy] = useState("always");
  const [fieldPayOn12, setFieldPayOn12] = useState(3);
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
  const [consecutivePSOs, setConsecutivePSOs] = useState(0);
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
        consecutivePSOs,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollCount]);

  const trackBet = (key, amt) => {
    const cat = classifyBet(key, { buyVigPolicy, fieldPayOn12 });
    const t = betTracker.current;
    t.total++;
    if (cat === "smart") { t.smart++; t.smartAmt += amt; }
    else if (cat === "ok") { t.ok++; t.okAmt += amt; }
    else { t.trash++; t.trashAmt += amt; }
    if (isOnStrategy(activeStrategy, key)) t.onStrat++; else t.offStrat++;
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
    if (key === "passOdds") { const max = getMaxOddsAmt(maxOdds, bets.pass, point); if (bets.passOdds >= max) return; }
    if (key === "dontPassOdds") { const max = getMaxOddsAmt(maxOdds, bets.dontPass, point); if (bets.dontPassOdds >= max) return; }
    var inc = getBetIncrement(key, betUnit);
    if (bankroll < inc) return;
    trackBet(key, inc);
    setBets((p) => ({ ...p, [key]: p[key] + inc }));
    setBankroll((p) => p - inc);
  };
  const removeBet = (key) => {
    if (bets[key] <= 0) return;
    if ((key === "pass" || key === "dontPass") && phase === "point") return;
    const inc = getBetIncrement(key, betUnit);
    const amt = Math.min(bets[key], inc);
    setBets((p) => ({ ...p, [key]: p[key] - amt }));
    setBankroll((p) => p + amt);
  };

  const addComeOdds = (idx) => {
    if (bankroll < betUnit) return;
    trackBet("comeOdds_post", betUnit);
    setComePoints((p) => p.map((cp, i) => {
      if (i !== idx) return cp;
      const max = getMaxOddsAmt(maxOdds, cp.amount, cp.number);
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
      const max = getMaxOddsAmt(maxOdds, dp.amount, dp.number);
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
      completeCrapsRoll({
        d1, d2, total, isHard,
        phase, point, bets, comePoints, dontComePoints,
        allSmallBet, allTallBet, allNumbersBet, allSmallHits, allTallHits, allNumbersHits,
        win, lose, push,
        setDie1, setDie2, lastRollRef,
        setRolling, setRollCount, setPoint, setPhase, setComePoints, setDontComePoints, setBets, setBankroll, setSessionWins, setSessionLosses, setLastRollNet, setAutoRolling, setShooterPaused,
        setAllSmallBet, setAllSmallHits, setAllTallBet, setAllTallHits, setAllNumbersBet, setAllNumbersHits,
        addLog,
        currentShooter, nextShooter,
        rotationEnabled, setCurrentShooterIdx,
        isBotShooter, autoRollTimerRef,
        soundEnabled,
        fieldPayOn12,
        setConsecutivePSOs,
      });
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
    setConsecutivePSOs(0);
  };

  const pnl = bankroll - startingBankroll + totalBets;
  const buildSnapshot = () => ({
    phase, point, bets, bankroll, startingBankroll, betUnit, maxOdds, activeStrategy,
    totalAtRisk: totalBets + comePoints.reduce((s,c)=>s+c.amount+c.odds,0) + dontComePoints.reduce((s,d)=>s+d.amount+d.odds,0),
    comePoints, dontComePoints, rollCount, sessionWins, sessionLosses,
    lastRoll: lastRollRef.current, lastResult: log.length > 0 ? log[log.length-1].msg : "No rolls yet",
    consecutivePSOs,
  });

  const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap'); @keyframes diceTumble { 0%{transform:translateY(-18px) rotate(-180deg) scale(.7);opacity:.3} 30%{transform:translateY(4px) rotate(40deg) scale(1.08);opacity:1} 50%{transform:translateY(-6px) rotate(-15deg) scale(1.02)} 70%{transform:translateY(2px) rotate(5deg) scale(1)} 85%{transform:translateY(-1px) rotate(-2deg)} 100%{transform:translateY(0) rotate(0) scale(1)} } @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} } @keyframes pulseGreen { 0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,.4)} 50%{box-shadow:0 0 0 8px rgba(76,175,80,0)} } @keyframes pulsePurple { 0%,100%{box-shadow:0 0 0 0 rgba(156,39,176,.4)} 50%{box-shadow:0 0 0 8px rgba(156,39,176,0)} } *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#333;border-radius:2px}`;
  const mono = "'JetBrains Mono', monospace";
  const pnl_ = { background: "#12121f", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" };

  if (showSetup) {
    return (
      <SetupScreen
        CSS={CSS}
        pnl_={pnl_}
        bankroll={bankroll}
        setBankroll={setBankroll}
        startingBankroll={startingBankroll}
        setStartingBankroll={setStartingBankroll}
        betUnit={betUnit}
        setBetUnit={setBetUnit}
        tableMin={tableMin}
        setTableMin={setTableMin}
        buyVigPolicy={buyVigPolicy}
        setBuyVigPolicy={setBuyVigPolicy}
        fieldPayOn12={fieldPayOn12}
        setFieldPayOn12={setFieldPayOn12}
        maxOdds={maxOdds}
        setMaxOdds={setMaxOdds}
        setShowSetup={setShowSetup}
      />
    );
  }

  const comeTotal = comePoints.reduce((s,c)=>s+c.amount+c.odds,0);
  const dcTotal = dontComePoints.reduce((s,d)=>s+d.amount+d.odds,0);

  const exposureCalc = (total) => calcOutcome({ phase, point, bets, comePoints, dontComePoints, fieldPayOn12 }, total);

  const riskTotal_ = totalBets + comePoints.reduce((s,c)=>s+c.amount+c.odds,0) + dontComePoints.reduce((s,d)=>s+d.amount+d.odds,0);
  const bankrollPct = startingBankroll > 0 ? Math.round((bankroll / startingBankroll) * 100) : 100;
  const exposurePct = bankroll > 0 ? Math.round((riskTotal_ / bankroll) * 100) : 0;
  const units = tableMin > 0 ? Math.floor(bankroll / tableMin) : 0;
  const unitsColor = units >= 20 ? "#4caf50" : units >= 10 ? "#ffc107" : "#f44336";

  const getZone = () => {
    if (bankrollPct <= 30 || units < 5) return { zone: "STOP", color: "#f44336", bg: "rgba(244,67,54,.12)", border: "rgba(244,67,54,.3)", msg: units < 5 ? `${units} units left — stop-loss territory. Walk or grind.` : "Below 30% — stop-loss territory. Walk or grind." };
    if (bankrollPct <= 50 || units < 10) return { zone: "DANGER", color: "#ff5722", bg: "rgba(255,87,34,.1)", border: "rgba(255,87,34,.25)", msg: units < 10 ? `Only ${units} units remaining. No new bets — let existing ones resolve.` : "Below half. No new bets — let existing ones resolve." };
    if (exposurePct > 20) return { zone: "HOT", color: "#ff9800", bg: "rgba(255,152,0,.08)", border: "rgba(255,152,0,.2)", msg: `${exposurePct}% of bankroll at risk — one 7 hurts.` };
    if (bankrollPct >= 130) return { zone: "HOUSE $", color: "#00e676", bg: "rgba(0,230,118,.08)", border: "rgba(0,230,118,.2)", msg: "Playing with profit. Lock in your buy-in mentally." };
    return { zone: "GREEN", color: "#4caf50", bg: "rgba(76,175,80,.06)", border: "rgba(76,175,80,.15)", msg: "Comfortable. Stick to your strategy." };
  };

  const zoneInfo = getZone();

  const handleScorecardNewSession = () => {
    setShowScorecard(false); setShowSetup(true);
    setBets(initialBets()); setPoint(null); setPhase("comeout"); setLog([]);
    setRollCount(0); setSessionWins(0); setSessionLosses(0);
    setComePoints([]); setDontComePoints([]); setBankroll(startingBankroll);
    setCoachAdvice(null); setLastRollNet(null);
    setAllSmallBet(0); setAllTallBet(0); setAllNumbersBet(0); setAllSmallHits([]); setAllTallHits([]); setAllNumbersHits([]);
    setCurrentShooterIdx(0); setAutoRolling(false); setShooterPaused(true);
    setConsecutivePSOs(0);
    betTracker.current = { smart: 0, ok: 0, trash: 0, smartAmt: 0, okAmt: 0, trashAmt: 0, total: 0, onStrat: 0, offStrat: 0, peak: startingBankroll, trough: startingBankroll };
    sessionStartRef.current = Date.now();
  };

  const handleFooterReset = () => {
    setBets(initialBets()); setPoint(null); setPhase("comeout"); setLog([]);
    setRollCount(0); setSessionWins(0); setSessionLosses(0);
    setComePoints([]); setDontComePoints([]); setBankroll(startingBankroll);
    setShowSetup(true); setCoachAdvice(null); setLastRollNet(null);
    setAllSmallBet(0); setAllTallBet(0); setAllNumbersBet(0); setAllSmallHits([]); setAllTallHits([]); setAllNumbersHits([]);
    setCurrentShooterIdx(0); setAutoRolling(false); setShooterPaused(true);
    setConsecutivePSOs(0);
    betTracker.current = { smart: 0, ok: 0, trash: 0, smartAmt: 0, okAmt: 0, trashAmt: 0, total: 0, onStrat: 0, offStrat: 0, peak: startingBankroll, trough: startingBankroll };
  };

  if (isDesktop) {
    return (
      <div style={{minHeight:"100vh",background:"#0a0a14",color:"#e0e0e0",fontFamily:"'DM Sans',sans-serif"}}>
        <style>{CSS}</style>
        <SessionScorecard
          showScorecard={showScorecard}
          pnl_={pnl_}
          betTracker={betTracker}
          sessionStartRef={sessionStartRef}
          bankroll={bankroll}
          startingBankroll={startingBankroll}
          rollCount={rollCount}
          sessionWins={sessionWins}
          sessionLosses={sessionLosses}
          activeStrategy={activeStrategy}
          onNewSession={handleScorecardNewSession}
          onBack={() => setShowScorecard(false)}
        />
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 24px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(10,10,20,.9)",backdropFilter:"blur(10px)",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:13,letterSpacing:".15em",color:"#4caf50",fontWeight:700}}>CRAPS TRAINER</span>
            <PhaseTag phase={phase} point={point} mono={mono} />
            {rotationEnabled && <ShooterTag isBotShooter={isBotShooter} currentShooter={currentShooter} nextShooter={nextShooter} mono={mono} />}
            <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:zoneInfo.bg,color:zoneInfo.color,fontWeight:700,fontFamily:mono,letterSpacing:".05em",border:`1px solid ${zoneInfo.border}`}}>{zoneInfo.zone}</span>
            <button onClick={()=>{const n=!rotationEnabled;setRotationEnabled(n);if(!n){setCurrentShooterIdx(0);setAutoRolling(false);setShooterPaused(true);if(autoRollTimerRef.current)clearTimeout(autoRollTimerRef.current);}}} title={rotationEnabled?"Shooter rotation ON":"Solo mode (you always shoot)"} style={{fontSize:14,background:"none",border:"none",cursor:"pointer",opacity:rotationEnabled?1:0.35,padding:0,lineHeight:1}}>👥</button>
            <button onClick={()=>setSoundEnabled(!soundEnabled)} style={{fontSize:16,background:"none",border:"none",cursor:"pointer",opacity:soundEnabled?1:0.3,padding:0,lineHeight:1}}>{soundEnabled?"🔊":"🔇"}</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:28}}>
            <TrainerStat label="BANKROLL" value={`$${bankroll.toLocaleString()}`} isDesktop={isDesktop} mono={mono} />
            <TrainerStat label="UNITS" value={units} color={unitsColor} isDesktop={isDesktop} mono={mono} />
            <TrainerStat label="P&L" value={`${pnl>=0?"+":""}${pnl}`} color={pnl>=0?"#4caf50":"#f44336"} isDesktop={isDesktop} mono={mono} />
            <TrainerStat label="ROLLS" value={rollCount} color="#888" isDesktop={isDesktop} mono={mono} />
            <TrainerStat label="AT RISK" value={`$${totalBets}`} color="#ff9800" isDesktop={isDesktop} mono={mono} />
            {lastRollNet!==null&&rollCount>0&&<TrainerStat label="LAST" value={`${lastRollNet>0?"+":""}${lastRollNet===0?"$0":`$${Math.abs(lastRollNet)}`}`} color={lastRollNet>0?"#4caf50":lastRollNet<0?"#f44336":"#666"} isDesktop={isDesktop} mono={mono} />}
          </div>
        </div>
        <div style={{display:"flex",height:"calc(100vh - 52px)",overflow:"hidden"}}>
          <div style={{width:320,minWidth:320,borderRight:"1px solid rgba(255,255,255,.06)",overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".15em",color:"#555"}}>BETS</div>
            <BankrollZone compact={false} pnl_={pnl_} zoneInfo={zoneInfo} bankrollPct={bankrollPct} exposurePct={exposurePct} mono={mono} bankroll={bankroll} currentTotalExposure={riskTotal_} units={units} />
            <BetPanel
              pnl_={pnl_}
              tab={tab}
              setTab={setTab}
              bets={bets}
              placeBet={placeBet}
              removeBet={removeBet}
              phase={phase}
              point={point}
              maxOdds={maxOdds}
              comePoints={comePoints}
              dontComePoints={dontComePoints}
              bankroll={bankroll}
              setBankroll={setBankroll}
              allSmallBet={allSmallBet}
              setAllSmallBet={setAllSmallBet}
              allTallBet={allTallBet}
              setAllTallBet={setAllTallBet}
              allNumbersBet={allNumbersBet}
              setAllNumbersBet={setAllNumbersBet}
              allSmallHits={allSmallHits}
              setAllSmallHits={setAllSmallHits}
              allTallHits={allTallHits}
              setAllTallHits={setAllTallHits}
              allNumbersHits={allNumbersHits}
              setAllNumbersHits={setAllNumbersHits}
              buyVigPolicy={buyVigPolicy}
              fieldPayOn12={fieldPayOn12}
            />
            <StrategyGuide
              pnl_={pnl_}
              activeStrategy={activeStrategy}
              setActiveStrategy={setActiveStrategy}
              bets={bets}
              phase={phase}
              point={point}
              betUnit={betUnit}
              comePoints={comePoints}
              maxOdds={maxOdds}
              bankroll={bankroll}
              tableMin={tableMin}
            />
            <ActiveBets
              pnl_={pnl_}
              mono={mono}
              bets={bets}
              comePoints={comePoints}
              dontComePoints={dontComePoints}
              totalBets={totalBets}
              comeTotal={comeTotal}
              dcTotal={dcTotal}
              maxOdds={maxOdds}
              bankroll={bankroll}
              betUnit={betUnit}
              addComeOdds={addComeOdds}
              removeComeOdds={removeComeOdds}
              addDcOdds={addDcOdds}
              removeDcOdds={removeDcOdds}
              buyVigPolicy={buyVigPolicy}
              fieldPayOn12={fieldPayOn12}
            />
            <BetEfficiency bets={bets} comePoints={comePoints} dontComePoints={dontComePoints} pnl_={pnl_} buyVigPolicy={buyVigPolicy} fieldPayOn12={fieldPayOn12} />
            <StrategyQuickRef pnl_={pnl_} showStrategy={showStrategy} setShowStrategy={setShowStrategy} />
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRight:"1px solid rgba(255,255,255,.06)",overflowY:"auto"}}>
            <DiceArea
              isDesktop={isDesktop}
              die1={die1}
              die2={die2}
              rolling={rolling}
              rotationEnabled={rotationEnabled}
              shooterTagSlot={<ShooterTag isBotShooter={isBotShooter} currentShooter={currentShooter} nextShooter={nextShooter} mono={mono} />}
              comePointPillsSlot={<ComePointPills comePoints={comePoints} dontComePoints={dontComePoints} mono={mono} />}
              rollButtonSlot={<GameRollButton onClick={handleRollButton} disabled={rolling || totalBets === 0} isDesktop isBotShooter={isBotShooter} isBotActive={isBotShooter && autoRolling && !shooterPaused} label={rollBtnLabel()} />}
              lastLogEntry={log.length > 0 ? { msg: log[log.length - 1].msg, type: log[log.length - 1].type } : null}
            />
            <div style={{padding:"0 16px 12px",width:"100%",maxWidth:520}}>
              <TableView
                pnl_={pnl_}
                mono={mono}
                bets={bets}
                point={point}
                phase={phase}
                comePoints={comePoints}
                dontComePoints={dontComePoints}
                allSmallBet={allSmallBet}
                allTallBet={allTallBet}
                allNumbersBet={allNumbersBet}
                allSmallHits={allSmallHits}
                allTallHits={allTallHits}
                allNumbersHits={allNumbersHits}
              />
            </div>
            <div style={{padding:"0 24px 16px",width:"100%",maxWidth:480}}>
              <Footer onEndSession={() => setShowScorecard(true)} onReset={handleFooterReset} sessionWins={sessionWins} sessionLosses={sessionLosses} />
            </div>
          </div>
          <div style={{width:380,minWidth:340,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".15em",color:"#555"}}>INTELLIGENCE</div>
            <CoachPanel
              pnl_={pnl_}
              coachAdvice={coachAdvice}
              coachLoading={coachLoading}
              coachEnabled={coachEnabled}
              setCoachAdvice={setCoachAdvice}
              setCoachEnabled={setCoachEnabled}
              askCoach={askCoach}
              buildSnapshot={buildSnapshot}
            />
            <ExposureMap
              pnl_={pnl_}
              mono={mono}
              maxOdds={maxOdds}
              comeTotal={comeTotal}
              dcTotal={dcTotal}
              totalBets={totalBets}
              calcOutcome={exposureCalc}
            />
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".15em",color:"#555",marginBottom:8}}>ROLL HISTORY</div>
              <RollLog ref={logRef} log={log} mono={mono} height={280} />
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
      <SessionScorecard
        showScorecard={showScorecard}
        pnl_={pnl_}
        betTracker={betTracker}
        sessionStartRef={sessionStartRef}
        bankroll={bankroll}
        startingBankroll={startingBankroll}
        rollCount={rollCount}
        sessionWins={sessionWins}
        sessionLosses={sessionLosses}
        activeStrategy={activeStrategy}
        onNewSession={handleScorecardNewSession}
        onBack={() => setShowScorecard(false)}
      />

      <div style={{position:"sticky",top:0,zIndex:10,background:"#0a0a14",borderBottom:"1px solid rgba(255,255,255,.06)"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"rgba(10,10,20,.95)"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <PhaseTag phase={phase} point={point} mono={mono} />
            {rotationEnabled && <ShooterTag compact isBotShooter={isBotShooter} currentShooter={currentShooter} nextShooter={nextShooter} mono={mono} />}
            <button onClick={()=>{const n=!rotationEnabled;setRotationEnabled(n);if(!n){setCurrentShooterIdx(0);setAutoRolling(false);setShooterPaused(true);if(autoRollTimerRef.current)clearTimeout(autoRollTimerRef.current);}}} style={{fontSize:12,background:"none",border:"none",cursor:"pointer",opacity:rotationEnabled?1:0.35,padding:0,lineHeight:1}}>👥</button>
            <button onClick={()=>setSoundEnabled(!soundEnabled)} style={{fontSize:14,background:"none",border:"none",cursor:"pointer",opacity:soundEnabled?1:0.3,padding:0,lineHeight:1}}>{soundEnabled?"🔊":"🔇"}</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"#666",fontWeight:700}}>BANK</div><div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:mono}}>${bankroll}</div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:8,color:"#666",fontWeight:700}}>UNITS</div><div style={{fontSize:12,fontWeight:700,color:unitsColor,fontFamily:mono}}>{units}</div></div>
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
          <GameRollButton onClick={handleRollButton} disabled={rolling || totalBets === 0} isDesktop={false} isBotShooter={isBotShooter} isBotActive={isBotShooter && autoRolling && !shooterPaused} label={rollBtnLabel()} />
        </div>

        <div style={{padding:"0 12px 8px"}}>
          <ComePointPills comePoints={comePoints} dontComePoints={dontComePoints} mono={mono} />
          {lastEntry && (
            <div style={{fontSize:10,fontFamily:mono,textAlign:"center",lineHeight:1.3,padding:"4px 8px",borderRadius:4,background:"rgba(255,255,255,.02)",
              color:lastEntry.type==="win"?"#4caf50":lastEntry.type==="lose"?"#f44336":lastEntry.type==="point"?"#ff9800":"#666",
            }}>{lastEntry.msg}</div>
          )}
        </div>
        <BankrollZone compact pnl_={pnl_} zoneInfo={zoneInfo} bankrollPct={bankrollPct} exposurePct={exposurePct} mono={mono} bankroll={bankroll} currentTotalExposure={riskTotal_} units={units} />
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
            <BetPanel
              pnl_={pnl_}
              tab={tab}
              setTab={setTab}
              bets={bets}
              placeBet={placeBet}
              removeBet={removeBet}
              phase={phase}
              point={point}
              maxOdds={maxOdds}
              comePoints={comePoints}
              dontComePoints={dontComePoints}
              bankroll={bankroll}
              setBankroll={setBankroll}
              allSmallBet={allSmallBet}
              setAllSmallBet={setAllSmallBet}
              allTallBet={allTallBet}
              setAllTallBet={setAllTallBet}
              allNumbersBet={allNumbersBet}
              setAllNumbersBet={setAllNumbersBet}
              allSmallHits={allSmallHits}
              setAllSmallHits={setAllSmallHits}
              allTallHits={allTallHits}
              setAllTallHits={setAllTallHits}
              allNumbersHits={allNumbersHits}
              setAllNumbersHits={setAllNumbersHits}
              buyVigPolicy={buyVigPolicy}
              fieldPayOn12={fieldPayOn12}
            />
            <StrategyGuide
              pnl_={pnl_}
              activeStrategy={activeStrategy}
              setActiveStrategy={setActiveStrategy}
              bets={bets}
              phase={phase}
              point={point}
              betUnit={betUnit}
              comePoints={comePoints}
              maxOdds={maxOdds}
              bankroll={bankroll}
              tableMin={tableMin}
            />
          </>}
          {mobileTab==="position"&&<>
            <BankrollZone compact={false} pnl_={pnl_} zoneInfo={zoneInfo} bankrollPct={bankrollPct} exposurePct={exposurePct} mono={mono} bankroll={bankroll} currentTotalExposure={riskTotal_} units={units} />
            <TableView
              pnl_={pnl_}
              mono={mono}
              bets={bets}
              point={point}
              phase={phase}
              comePoints={comePoints}
              dontComePoints={dontComePoints}
              allSmallBet={allSmallBet}
              allTallBet={allTallBet}
              allNumbersBet={allNumbersBet}
              allSmallHits={allSmallHits}
              allTallHits={allTallHits}
              allNumbersHits={allNumbersHits}
            />
            <ActiveBets
              pnl_={pnl_}
              mono={mono}
              bets={bets}
              comePoints={comePoints}
              dontComePoints={dontComePoints}
              totalBets={totalBets}
              comeTotal={comeTotal}
              dcTotal={dcTotal}
              maxOdds={maxOdds}
              bankroll={bankroll}
              betUnit={betUnit}
              addComeOdds={addComeOdds}
              removeComeOdds={removeComeOdds}
              addDcOdds={addDcOdds}
              removeDcOdds={removeDcOdds}
              buyVigPolicy={buyVigPolicy}
              fieldPayOn12={fieldPayOn12}
            />
            <BetEfficiency bets={bets} comePoints={comePoints} dontComePoints={dontComePoints} pnl_={pnl_} buyVigPolicy={buyVigPolicy} fieldPayOn12={fieldPayOn12} />
            <ExposureMap
              pnl_={pnl_}
              mono={mono}
              maxOdds={maxOdds}
              comeTotal={comeTotal}
              dcTotal={dcTotal}
              totalBets={totalBets}
              calcOutcome={exposureCalc}
            />
          </>}
          {mobileTab==="coach"&&<>
            <CoachPanel
              pnl_={pnl_}
              coachAdvice={coachAdvice}
              coachLoading={coachLoading}
              coachEnabled={coachEnabled}
              setCoachAdvice={setCoachAdvice}
              setCoachEnabled={setCoachEnabled}
              askCoach={askCoach}
              buildSnapshot={buildSnapshot}
            />
          </>}
          {mobileTab==="more"&&<>
            <RollLog ref={logRef} log={log} mono={mono} height={200} />
            <StrategyQuickRef pnl_={pnl_} showStrategy={showStrategy} setShowStrategy={setShowStrategy} />
            <Footer onEndSession={() => setShowScorecard(true)} onReset={handleFooterReset} sessionWins={sessionWins} sessionLosses={sessionLosses} />
          </>}
        </div>
      </div>
    </div>
  );
}
