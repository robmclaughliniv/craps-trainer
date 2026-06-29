import { describe, it, expect } from "vitest";
import {
  calcOutcome,
  classifyBet,
  getMaxOddsAmt,
  getBetIncrement,
  getBetMinimum,
  getBetAddAmount,
  getBetRemoveAmount,
  getBuyHE,
  getFieldHE,
  initialBets,
  ODDS_PAY,
  PLACE_PAY,
  ROLL_PROB,
  HOUSE_EDGES,
} from "./betLogic.js";

const base = {
  phase: "point",
  point: 6,
  bets: initialBets(),
  comePoints: [],
  dontComePoints: [],
};

// Build a snapshot for calcOutcome with only the bets we care about set.
const withBets = (overrides, extra = {}) => ({
  ...base,
  ...extra,
  bets: { ...initialBets(), ...overrides },
});

describe("payout tables", () => {
  it("odds pay true odds", () => {
    expect(ODDS_PAY[4]).toEqual([2, 1]);
    expect(ODDS_PAY[5]).toEqual([3, 2]);
    expect(ODDS_PAY[6]).toEqual([6, 5]);
  });

  it("place pays casino odds", () => {
    expect(PLACE_PAY[6]).toEqual([7, 6]);
    expect(PLACE_PAY[5]).toEqual([7, 5]);
    expect(PLACE_PAY[4]).toEqual([9, 5]);
  });

  it("roll probabilities sum to 36 ways", () => {
    const total = Object.values(ROLL_PROB).reduce((a, b) => a + b, 0);
    expect(total).toBe(36);
  });

  it("odds bet has zero house edge", () => {
    expect(HOUSE_EDGES.odds).toBe(0);
  });
});

describe("calcOutcome - pass line", () => {
  it("pays even money when point hits during point phase", () => {
    expect(calcOutcome(withBets({ pass: 10 }), 6)).toBe(10);
  });

  it("loses on a seven-out during point phase", () => {
    expect(calcOutcome(withBets({ pass: 10 }), 7)).toBe(-10);
  });

  it("no decision on a non-point, non-seven number", () => {
    expect(calcOutcome(withBets({ pass: 10 }), 5)).toBe(0);
  });

  it("wins on 7/11 on the come-out roll", () => {
    expect(calcOutcome(withBets({ pass: 10 }, { phase: "comeout" }), 7)).toBe(10);
    expect(calcOutcome(withBets({ pass: 10 }, { phase: "comeout" }), 11)).toBe(10);
  });

  it("loses on 2/3/12 on the come-out roll", () => {
    expect(calcOutcome(withBets({ pass: 10 }, { phase: "comeout" }), 2)).toBe(-10);
    expect(calcOutcome(withBets({ pass: 10 }, { phase: "comeout" }), 12)).toBe(-10);
  });
});

describe("calcOutcome - don't pass", () => {
  it("wins on a seven-out during point phase", () => {
    expect(calcOutcome(withBets({ dontPass: 10 }), 7)).toBe(10);
  });

  it("loses when point hits during point phase", () => {
    expect(calcOutcome(withBets({ dontPass: 10 }), 6)).toBe(-10);
  });

  it("wins on 2/3 on the come-out roll", () => {
    expect(calcOutcome(withBets({ dontPass: 10 }, { phase: "comeout" }), 2)).toBe(10);
    expect(calcOutcome(withBets({ dontPass: 10 }, { phase: "comeout" }), 3)).toBe(10);
  });

  it("loses on 7/11 on the come-out roll", () => {
    expect(calcOutcome(withBets({ dontPass: 10 }, { phase: "comeout" }), 7)).toBe(-10);
    expect(calcOutcome(withBets({ dontPass: 10 }, { phase: "comeout" }), 11)).toBe(-10);
  });
});

describe("calcOutcome - odds", () => {
  it("pays pass odds at true odds on point (6 => 6:5)", () => {
    expect(calcOutcome(withBets({ passOdds: 10 }), 6)).toBe(12);
  });

  it("pays pass odds 2:1 on the 4", () => {
    expect(calcOutcome(withBets({ passOdds: 10 }, { point: 4 }), 4)).toBe(20);
  });

  it("loses pass odds on a seven-out", () => {
    expect(calcOutcome(withBets({ passOdds: 10 }), 7)).toBe(-10);
  });

  it("pays don't pass odds at inverse true odds on the 6 (5:6)", () => {
    // floor(10 * 5/6) = 8
    expect(calcOutcome(withBets({ dontPassOdds: 12 }), 7)).toBe(10);
  });
});

describe("calcOutcome - place bets", () => {
  it("pays place 6 at 7:6", () => {
    expect(calcOutcome(withBets({ place6: 12 }), 6)).toBe(14);
  });

  it("pays place 4 at 9:5", () => {
    expect(calcOutcome(withBets({ place4: 10 }), 4)).toBe(18);
  });

  it("loses place bets on a seven", () => {
    expect(calcOutcome(withBets({ place6: 12 }), 7)).toBe(-12);
  });

  it("place bets are not working on the come-out roll", () => {
    expect(calcOutcome(withBets({ place6: 12 }, { phase: "comeout" }), 6)).toBe(0);
  });
});

describe("calcOutcome - field", () => {
  it("pays even money on 3/4/9/10/11", () => {
    [3, 4, 9, 10, 11].forEach((t) => {
      expect(calcOutcome(withBets({ field: 5 }), t)).toBe(5);
    });
  });

  it("pays double on the 2", () => {
    expect(calcOutcome(withBets({ field: 5 }), 2)).toBe(10);
  });

  it("respects fieldPayOn12 setting on the 12", () => {
    expect(calcOutcome(withBets({ field: 5 }, { fieldPayOn12: 3 }), 12)).toBe(15);
    expect(calcOutcome(withBets({ field: 5 }, { fieldPayOn12: 2 }), 12)).toBe(10);
  });

  it("loses on 5/6/7/8", () => {
    [5, 6, 7, 8].forEach((t) => {
      expect(calcOutcome(withBets({ field: 5 }), t)).toBe(-5);
    });
  });
});

describe("calcOutcome - prop bets", () => {
  it("any 7 pays 4:1", () => {
    expect(calcOutcome(withBets({ any7: 5 }), 7)).toBe(20);
    expect(calcOutcome(withBets({ any7: 5 }), 6)).toBe(-5);
  });

  it("yo pays 15:1 on 11", () => {
    expect(calcOutcome(withBets({ yo: 1 }), 11)).toBe(15);
  });

  it("boxcars pays 30:1 on 12", () => {
    expect(calcOutcome(withBets({ boxcars: 1 }), 12)).toBe(30);
  });

  it("aces pays 30:1 on 2", () => {
    expect(calcOutcome(withBets({ aces: 1 }), 2)).toBe(30);
  });
});

describe("calcOutcome - come / don't come points", () => {
  it("pays a come point with odds when its number hits", () => {
    const snap = withBets({}, { comePoints: [{ number: 4, amount: 10, odds: 10 }] });
    // flat 10 + floor(10 * 2/1) = 30
    expect(calcOutcome(snap, 4)).toBe(30);
  });

  it("loses come points on a seven", () => {
    const snap = withBets({}, { comePoints: [{ number: 4, amount: 10, odds: 10 }] });
    expect(calcOutcome(snap, 7)).toBe(-20);
  });
});

describe("getMaxOddsAmt", () => {
  it("multiplies flat bet for fixed multipliers", () => {
    expect(getMaxOddsAmt("1x", 10)).toBe(10);
    expect(getMaxOddsAmt("2x", 10)).toBe(20);
    expect(getMaxOddsAmt("5x", 10)).toBe(50);
    expect(getMaxOddsAmt("10x", 10)).toBe(100);
  });

  it("uses 3-4-5x table when not a fixed multiplier", () => {
    expect(getMaxOddsAmt("3-4-5x", 10, 4)).toBe(30);
    expect(getMaxOddsAmt("3-4-5x", 10, 5)).toBe(40);
    expect(getMaxOddsAmt("3-4-5x", 10, 6)).toBe(50);
  });
});

describe("getBetIncrement", () => {
  it("uses 6 for place 6 and 8", () => {
    expect(getBetIncrement("place6", 5)).toBe(6);
    expect(getBetIncrement("place8", 5)).toBe(6);
  });

  it("uses 4 for horn", () => {
    expect(getBetIncrement("horn", 5)).toBe(4);
  });

  it("uses table min otherwise", () => {
    expect(getBetIncrement("pass", 25)).toBe(25);
    expect(getBetIncrement("pass", 10)).toBe(10);
  });
});

describe("getBetMinimum / getBetAddAmount / getBetRemoveAmount", () => {
  it("computes place 6/8 minimum from table min", () => {
    expect(getBetMinimum("place6", 5)).toBe(6);
    expect(getBetMinimum("place8", 10)).toBe(12);
    expect(getBetMinimum("place6", 15)).toBe(18);
    expect(getBetMinimum("place8", 25)).toBe(30);
  });

  it("first place 6 add uses minimum, then increment", () => {
    expect(getBetAddAmount("place6", 10, 0)).toBe(12);
    expect(getBetAddAmount("place6", 10, 12)).toBe(6);
    expect(getBetAddAmount("place8", 10, 18)).toBe(6);
  });

  it("remove from place 6/8 respects minimum floor", () => {
    expect(getBetRemoveAmount("place6", 10, 18)).toBe(6);
    expect(getBetRemoveAmount("place6", 10, 12)).toBe(12);
    expect(getBetRemoveAmount("place8", 10, 12)).toBe(12);
  });

  it("line bets use table min for first add and increment", () => {
    expect(getBetMinimum("pass", 10)).toBe(10);
    expect(getBetAddAmount("pass", 10, 0)).toBe(10);
    expect(getBetAddAmount("pass", 10, 10)).toBe(10);
    expect(getBetRemoveAmount("pass", 10, 25)).toBe(10);
  });

  it("line bets at higher table mins", () => {
    expect(getBetAddAmount("pass", 25, 0)).toBe(25);
    expect(getBetAddAmount("pass", 25, 25)).toBe(25);
    expect(getBetRemoveAmount("pass", 25, 50)).toBe(25);
  });

  it("come and dc odds follow table min", () => {
    expect(getBetAddAmount("comeOdds", 25, 0)).toBe(25);
    expect(getBetAddAmount("comeOdds", 25, 25)).toBe(25);
    expect(getBetRemoveAmount("comeOdds", 25, 50)).toBe(25);
    expect(getBetAddAmount("dontComeOdds", 25, 0)).toBe(25);
  });
});

describe("getBuyHE / getFieldHE", () => {
  it("buy 4/10 edge drops with on-win vig", () => {
    expect(getBuyHE(4, "on-win")).toBe(1.67);
    expect(getBuyHE(4, "always")).toBe(4.76);
  });

  it("field edge depends on the 12 payout", () => {
    expect(getFieldHE(2)).toBe(5.56);
    expect(getFieldHE(3)).toBe(2.78);
  });
});

describe("classifyBet", () => {
  it("classes pass and odds as smart", () => {
    expect(classifyBet("pass")).toBe("smart");
    expect(classifyBet("passOdds")).toBe("smart");
  });

  it("buy depends on vig policy", () => {
    expect(classifyBet("buy4", { buyVigPolicy: "on-win" })).toBe("smart");
    expect(classifyBet("buy4", { buyVigPolicy: "always" })).toBe("ok");
  });

  it("field depends on the 12 payout", () => {
    expect(classifyBet("field", { fieldPayOn12: 2 })).toBe("trash");
    expect(classifyBet("field", { fieldPayOn12: 3 })).toBe("ok");
  });

  it("classes prop bets as trash", () => {
    expect(classifyBet("any7")).toBe("trash");
    expect(classifyBet("boxcars")).toBe("trash");
  });
});
