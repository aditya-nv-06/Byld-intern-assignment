import { Request, Response } from "express";
import { TRANSACTION_TYPE } from "../../generated/prisma/enums";
import { prisma } from "../../database/primaClient";
import { ApiResponse } from "../../utils/types";
import { MESSAGES } from "../../constants/messages";
import { sendError, sendSuccess } from "../../utils/http";
import { computeSellValueToRemove, toCents } from "../../utils/money";
import { formatHolding, parseRequest, transactionSchema, uuidParamsSchema } from "./shared";

// Creates a sell transaction and reduces or removes the matching holding.
const sellHolding = async (req: Request, res: Response<ApiResponse>) => {
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

    const existingHolding = await prisma.holdings.findFirst({
      where: {
        portfolioId,
        holding_name: symbol,
        exchange,
        asset_category: assetCategory,
      },
    });

    if (!existingHolding || existingHolding.holding_units < quantity) {
      req.log.warn({ portfolioId, symbol, quantity }, MESSAGES.INSUFFICIENT_HOLDING_QUANTITY);
      return sendError(req, res, 409, MESSAGES.INSUFFICIENT_HOLDING_QUANTITY, "INSUFFICIENT_HOLDING_QUANTITY");
    }

    const updatedHolding = await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          portfolioId,
          symbol,
          quantity,
          price: priceCents,
          exchange,
          asset_category: assetCategory,
          type: TRANSACTION_TYPE.SELL,
        },
      });

      const valueToRemove = computeSellValueToRemove(
        existingHolding.holding_value,
        existingHolding.holding_units,
        quantity
      );
      const newUnits = existingHolding.holding_units - quantity;
      const newValue = existingHolding.holding_value - valueToRemove;

      if (newUnits === 0) {
        await tx.holdings.delete({ where: { id: existingHolding.id } });
        return null;
      }

      return tx.holdings.update({
        where: { id: existingHolding.id },
        data: {
          holding_units: newUnits,
          holding_value: newValue,
        },
        select: {
          holding_name: true,
          holding_units: true,
          holding_value: true,
          exchange: true,
          asset_category: true,
        },
      });
    });

    req.log.info({ portfolioId, symbol, exchange, assetCategory, quantity }, MESSAGES.SELL_EXECUTED);

    return sendSuccess(res, 201, MESSAGES.SELL_EXECUTED, updatedHolding ? formatHolding(updatedHolding) : null);
  } catch (_error) {
    return sendError(req, res, 500, MESSAGES.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
  }
};

export {
  sellHolding,
};