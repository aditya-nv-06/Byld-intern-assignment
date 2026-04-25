import { describe, expect, it } from "vitest";
import { centsToAmount, computeSellValueToRemove, toCents, weightedAverageCost } from "../../src/utils/money";

describe("money utils", () => {
  it("converts rupees to cents with stable rounding", () => {
    expect(toCents(2984.25)).toBe(298425n);
    expect(toCents(123.456)).toBe(12346n);
  });

  it("computes weighted average cost for holdings", () => {
    const totalCostCents = 149212n;
    const average = weightedAverageCost(totalCostCents, 5);

    expect(average).toBe(298.424);
  });

  it("computes sell value removal without floating-point drift", () => {
    const removed = computeSellValueToRemove(149212n, 5, 2);

    expect(removed).toBe(59685n);
    expect(centsToAmount(removed)).toBe(596.85);
  });
});