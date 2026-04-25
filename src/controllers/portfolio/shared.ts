import { z } from "zod";
import { ASSET_CATEGORY, EXCHANGE, RISK } from "../../generated/prisma/enums";
import { MESSAGES } from "../../constants/messages";
import { weightedAverageCost } from "../../utils/money";

const uuidParamsSchema = z.object({
  id: z.string().uuid(),
});

const createPortfolioSchema = z.object({
  clientName: z.string().trim().min(1),
  riskProfile: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.enum([RISK.LOW, RISK.MODERATE, RISK.AGGRESSIVE])),
});

const transactionSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toUpperCase()),
  exchange: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.enum([EXCHANGE.NSE, EXCHANGE.BSE])),
  assetCategory: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.enum([ASSET_CATEGORY.ETF, ASSET_CATEGORY.MTF, ASSET_CATEGORY.BONDS, ASSET_CATEGORY.SHARES, ASSET_CATEGORY.STOCKS])),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

// Validates a payload and returns a typed success or error result.
const parseRequest = <T,>(
  schema: z.ZodType<T>,
  value: unknown
): { success: true; data: T } | { success: false; message: string; details?: string[] } => {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    });
    return { success: false, message: parsed.error.issues[0]?.message ?? MESSAGES.INVALID_INPUT, details };
  }

  return { success: true, data: parsed.data };
};

type HoldingLike = {
  holding_name: string;
  holding_units: number;
  holding_value: bigint;
  exchange: EXCHANGE;
  asset_category: ASSET_CATEGORY;
};

// Normalizes a holding record into the API response shape.
const formatHolding = (holding: HoldingLike) => ({
  symbol: holding.holding_name,
  exchange: holding.exchange,
  assetCategory: holding.asset_category,
  quantity: holding.holding_units,
  weightedAverageCostBasis: weightedAverageCost(holding.holding_value, holding.holding_units),
});

export {
  type HoldingLike,
  createPortfolioSchema,
  formatHolding,
  parseRequest,
  transactionSchema,
  uuidParamsSchema,
};