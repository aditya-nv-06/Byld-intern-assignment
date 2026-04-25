const MESSAGES = {
  INVALID_INPUT: "Invalid input.",
  INTERNAL_SERVER_ERROR: "Internal server error.",
  PORTFOLIO_CREATED: "Portfolio created successfully.",
  PORTFOLIO_FETCHED: "Portfolio fetched successfully.",
  PORTFOLIO_NOT_FOUND: "Portfolio not found.",
  BUY_EXECUTED: "Buy transaction created successfully.",
  SELL_EXECUTED: "Sell transaction created successfully.",
  INSUFFICIENT_HOLDING_QUANTITY: "Sell quantity exceeds held quantity.",
  HOLDINGS_FETCHED: "Holdings fetched successfully.",
} as const;

export { MESSAGES };
