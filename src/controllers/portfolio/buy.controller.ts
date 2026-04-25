import { Request, Response } from "express";
import { TRANSACTION_TYPE } from "../../generated/prisma/enums";
import { prisma } from "../../database/primaClient";
import { ApiResponse } from "../../utils/types";
import { MESSAGES } from "../../constants/messages";
import { sendError, sendSuccess } from "../../utils/http";
import { toCents } from "../../utils/money";
import { formatHolding, parseRequest, transactionSchema, uuidParamsSchema } from "./shared";

// Creates a buy transaction and updates or creates the matching holding.
const buyHolding = async (req: Request, res: Response<ApiResponse>) => {
  const paramsParsed = parseRequest(uuidParamsSchema, req.params);

  if (!paramsParsed.success) {
    return sendError(req, res, 400, paramsParsed.message, "INVALID_INPUT", paramsParsed.details);
  }

  const bodyParsed = parseRequest(transactionSchema, req.body);

  if (!bodyParsed.success) {
    return sendError(req, res, 400, bodyParsed.message, "INVALID_INPUT", bodyParsed.details);
  }

  const portfolioId = paramsParsed.data.id;
  const { symbol, exchange, assetCategory, quantity, price } = bodyParsed.data;
  const priceCents = toCents(price);

  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });

    if (!portfolio) {
      return sendError(req, res, 404, MESSAGES.PORTFOLIO_NOT_FOUND, "PORTFOLIO_NOT_FOUND");
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          portfolioId,
          symbol,
          quantity,
          price: priceCents,
          exchange,
          asset_category: assetCategory,
          type: TRANSACTION_TYPE.BUY,
        },
      });

      const existingHolding = await tx.holdings.findFirst({
        where: {
          portfolioId,
          holding_name: symbol,
          exchange,
          asset_category: assetCategory,
        },
      });

      if (!existingHolding) {
        return tx.holdings.create({
          data: {
            portfolioId,
            holding_name: symbol,
            holding_units: quantity,
            holding_value: BigInt(quantity) * priceCents,
            exchange,
            asset_category: assetCategory,
          },
        });
      }

      return tx.holdings.update({
        where: { id: existingHolding.id },
        data: {
          holding_units: existingHolding.holding_units + quantity,
          holding_value: existingHolding.holding_value + BigInt(quantity) * priceCents,
        },
      });
    });

    req.log.info({ portfolioId, symbol, exchange, assetCategory, quantity }, MESSAGES.BUY_EXECUTED);

    return sendSuccess(res, 201, MESSAGES.BUY_EXECUTED, formatHolding(result));
  } catch (_error) {
    return sendError(req, res, 500, MESSAGES.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
  }
};

export {
  buyHolding,
};