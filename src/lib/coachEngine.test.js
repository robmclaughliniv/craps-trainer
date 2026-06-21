import { describe, it, expect } from "vitest";
import { getLocalInstinct } from "./coachEngine.js";
import { initialBets } from "./betLogic.js";

// A healthy mid-session snapshot. Individual tests override only what they need.
const snap = (overrides = {}) => ({
  phase: "point",
  point: 6,
  bets: initialBets(),
  bankroll: 1000,
  startingBankroll: 1000,
  comePoints: [],
  totalAtRisk: 0,
  consecutivePSOs: 0,
  activeStrategy: null,
  betUnit: 10,
  lastRoll: null,
  lastResult: null,
  ...overrides,
});

describe("getLocalInstinct - bankroll stop-loss", () => {
  it("flags overexposed below 30% of buy-in", () => {
    expect(getLocalInstinct(snap({ bankroll: 250 })).risk).toBe("overexposed");
  });

  it("flags preservation mode below 50% of buy-in", () => {
    expect(getLocalInstinct(snap({ bankroll: 450 })).risk).toBe("high");
  });
});

describe("getLocalInstinct - consecutive seven-outs", () => {
  it("escalates at 5 PSOs", () => {
    const r = getLocalInstinct(snap({ consecutivePSOs: 5 }));
    expect(r.risk).toBe("high");
    expect(r.risk_note).toContain("5 PSOs");
  });

  it("warns about tilt at 3 PSOs", () => {
    const r = getLocalInstinct(snap({ consecutivePSOs: 3 }));
    expect(r.risk).toBe("medium");
    expect(r.risk_note).toContain("3 PSOs");
  });
});

describe("getLocalInstinct - bet quality", () => {
  it("calls out center/prop bets", () => {
    const bets = { ...initialBets(), pass: 10, passOdds: 30, any7: 5 };
    const r = getLocalInstinct(snap({ bets }));
    expect(r.risk).toBe("high");
    expect(r.instinct).toMatch(/center of the table/i);
  });

  it("calls out hardways", () => {
    const bets = { ...initialBets(), pass: 10, passOdds: 30, hardway6: 5 };
    const r = getLocalInstinct(snap({ bets }));
    expect(r.risk).toBe("high");
    expect(r.instinct).toMatch(/hardways/i);
  });

  it("detects an Iron Cross without an active strategy", () => {
    const bets = { ...initialBets(), field: 5, place5: 10, place6: 12, place8: 12 };
    const r = getLocalInstinct(snap({ bets }));
    expect(r.risk_note).toMatch(/Iron Cross/i);
  });
});

describe("getLocalInstinct - exposure and profit", () => {
  it("flags over-exposure when >25% of bankroll is at risk", () => {
    const bets = { ...initialBets(), pass: 10, passOdds: 30 };
    const r = getLocalInstinct(snap({ bets, totalAtRisk: 300 }));
    expect(r.risk).toBe("high");
    expect(r.instinct).toMatch(/overexposed/i);
  });

  it("suggests walking when up 50%+", () => {
    const bets = { ...initialBets(), pass: 10, passOdds: 30 };
    const r = getLocalInstinct(snap({ bets, bankroll: 1500 }));
    expect(r.instinct).toMatch(/walking/i);
  });
});

describe("getLocalInstinct - come-out guidance", () => {
  it("tells you to place a pass bet with nothing on the table", () => {
    const r = getLocalInstinct(snap({ phase: "comeout" }));
    expect(r.action).toMatch(/Pass Line/i);
  });
});

describe("getLocalInstinct - point-phase odds nudges", () => {
  it("pushes you to max odds when pass has none", () => {
    const bets = { ...initialBets(), pass: 10, passOdds: 0 };
    const r = getLocalInstinct(snap({ bets }));
    expect(r.instinct).toMatch(/odds/i);
    expect(r.action).toMatch(/odds/i);
  });

  it("falls back to basics when well-positioned", () => {
    const bets = { ...initialBets(), pass: 10, passOdds: 30, place6: 12, place8: 12 };
    const r = getLocalInstinct(snap({ bets }));
    expect(r.risk).toBe("low");
  });
});
