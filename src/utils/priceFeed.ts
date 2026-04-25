/**
 * Deterministic price feed for testing and development.
 * Returns mock prices for Indian stocks (primarily NSE listed companies).
 * Prices fluctuate deterministically based on symbol and current timestamp.
 */

import Decimal from "decimal.js";

interface StockPrice {
  symbol: string;
  price: bigint; // in paise (100 paise = 1 rupee)
  timestamp: Date;
}

// Base prices (in rupees) for common Indian stocks
const baseStockPrices: Record<string, number> = {
  RELIANCE: 2984.25,
  TCS: 3850.50,
  INFY: 1925.75,
  WIPRO: 425.30,
  ICICIBANK: 825.60,
  HDFC: 2650.40,
  LT: 3200.80,
  MARUTI: 9850.25,
  BAJAJ_AUTO: 5675.40,
  BHARTIARTL: 525.80,
};

/**
 * Get current price for a symbol.
 * Uses a deterministic hash of symbol + minute to simulate price movement.
 * Prices vary by ±5% from base price within each minute window.
 * @param symbol - Stock symbol (e.g., 'RELIANCE', 'TCS')
 * @returns StockPrice with price in paise
 */
export const getPriceForSymbol = (symbol: string): StockPrice => {
  const basePrice = baseStockPrices[symbol.toUpperCase()] || 500; // Default to 500 if not found

  // Deterministic variation: use symbol hash + minute for reproducibility
  const now = new Date();
  const minuteKey = `${symbol}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
  const hash = hashCode(minuteKey);

  // Create price variation in range [-5%, +5%]
  const variationPercent = ((hash % 10) - 5) / 100; // -5 to +5 percent
  const variation = basePrice * variationPercent;
  const adjustedPrice = basePrice + variation;

  // Convert to paise (multiply by 100 and round to nearest integer)
  const priceInPaise = BigInt(
    new Decimal(adjustedPrice).mul(100).toDecimalPlaces(0).toString()
  );

  return {
    symbol: symbol.toUpperCase(),
    price: priceInPaise,
    timestamp: now,
  };
};

/**
 * Get prices for multiple symbols
 * @param symbols - Array of stock symbols
 * @returns Array of StockPrice objects
 */
export const getPricesForSymbols = (symbols: string[]): StockPrice[] => {
  return symbols.map((symbol) => getPriceForSymbol(symbol));
};

/**
 * Simple hash function for deterministic variation
 * @param str - String to hash
 * @returns Numeric hash value
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Check if an alert condition is met
 * @param currentPrice - Current price in paise
 * @param targetPrice - Alert target price in paise
 * @param kind - Alert kind ('ABOVE' or 'BELOW')
 * @returns true if alert condition is met
 */
export const shouldFireAlert = (
  currentPrice: bigint,
  targetPrice: bigint,
  kind: "ABOVE" | "BELOW"
): boolean => {
  if (kind === "ABOVE") {
    return currentPrice >= targetPrice;
  } else if (kind === "BELOW") {
    return currentPrice <= targetPrice;
  }
  return false;
};
