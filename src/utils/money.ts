import Decimal from "decimal.js";

const CENTS_FACTOR = new Decimal(100);

// Converts rupee values to paise (cents) with deterministic half-up rounding.
const toCents = (price: number | string): bigint => {
  const cents = new Decimal(price).mul(CENTS_FACTOR).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  return BigInt(cents.toString());
};

// Converts paise (cents) back to rupees for API output.
const centsToAmount = (value: bigint): number => {
  return new Decimal(value.toString()).div(CENTS_FACTOR).toNumber();
};

// Computes weighted average cost per unit in rupees.
const weightedAverageCost = (holdingValueCents: bigint, holdingUnits: number): number => {
  if (holdingUnits <= 0) {
    return 0;
  }

  return new Decimal(holdingValueCents.toString())
    .div(holdingUnits)
    .div(CENTS_FACTOR)
    .toDecimalPlaces(4, Decimal.ROUND_HALF_UP)
    .toNumber();
};

// Calculates how much cost-basis value should be removed for a sell quantity.
const computeSellValueToRemove = (
  holdingValueCents: bigint,
  holdingUnits: number,
  sellUnits: number
): bigint => {
  if (holdingUnits <= 0 || sellUnits <= 0) {
    return 0n;
  }

  const averageCostPerUnitCents = new Decimal(holdingValueCents.toString()).div(holdingUnits);
  const removed = averageCostPerUnitCents
    .mul(sellUnits)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  const removedBigInt = BigInt(removed.toString());

  return removedBigInt > holdingValueCents ? holdingValueCents : removedBigInt;
};

export {
  centsToAmount,
  computeSellValueToRemove,
  toCents,
  weightedAverageCost,
};