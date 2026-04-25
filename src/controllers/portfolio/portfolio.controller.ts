import { Request, Response } from "express";
import { TRANSACTION_TYPE } from "../../generated/prisma/enums";
import { prisma } from "../../database/primaClient";
import { ApiResponse } from "../../utils/types";
import { MESSAGES } from "../../constants/messages";
import { sendError, sendSuccess } from "../../utils/http";
import { centsToAmount } from "../../utils/money";
import { createPortfolioSchema, formatHolding, parseRequest, uuidParamsSchema } from "./shared";

// Creates a new portfolio for a client.
const createPortfolio = async (req: Request, res: Response<ApiResponse>) => {
  const bodyParsed = parseRequest(createPortfolioSchema, req.body);

  if (!bodyParsed.success) {
    return sendError(req, res, 400, bodyParsed.message, "INVALID_INPUT", bodyParsed.details);
  }

  try {
    const portfolio = await prisma.portfolio.create({
      data: {
        portfolio_name: bodyParsed.data.clientName,
        portfolio_risk: bodyParsed.data.riskProfile,
      },
    });

    req.log.info({ portfolioId: portfolio.id }, MESSAGES.PORTFOLIO_CREATED);

    return sendSuccess(res, 201, MESSAGES.PORTFOLIO_CREATED, {
      id: portfolio.id,
      clientName: portfolio.portfolio_name,
      riskProfile: portfolio.portfolio_risk,
    });
  } catch (_error) {
    return sendError(req, res, 500, MESSAGES.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
  }
};

// Returns a summary of portfolio cash and holdings.
const getPortfolioSummary = async (req: Request, res: Response<ApiResponse>) => {
  const paramsParsed = parseRequest(uuidParamsSchema, req.params);

  if (!paramsParsed.success) {
    return sendError(req, res, 400, paramsParsed.message, "INVALID_INPUT", paramsParsed.details);
  }

  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: paramsParsed.data.id },
      include: {
        portfolio_hold: {
          select: {
            holding_name: true,
            holding_units: true,
            holding_value: true,
            exchange: true,
            asset_category: true,
          },
        },
        transactions: true,
      },
    });

    if (!portfolio) {
      return sendError(req, res, 404, MESSAGES.PORTFOLIO_NOT_FOUND, "PORTFOLIO_NOT_FOUND");
    }

    const cashBalanceCents = portfolio.transactions.reduce((acc, transaction) => {
      const amount = BigInt(transaction.quantity) * transaction.price;
      return transaction.type === TRANSACTION_TYPE.BUY ? acc - amount : acc + amount;
    }, 0n);

    return sendSuccess(res, 200, MESSAGES.PORTFOLIO_FETCHED, {
      id: portfolio.id,
      clientName: portfolio.portfolio_name,
      riskProfile: portfolio.portfolio_risk,
      cashBalance: centsToAmount(cashBalanceCents),
      holdings: portfolio.portfolio_hold.map(formatHolding),
    });
  } catch (_error) {
    return sendError(req, res, 500, MESSAGES.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
  }
};

export {
  createPortfolio,
  getPortfolioSummary,
};