import { Request, Response } from "express";
import { prisma } from "../../database/primaClient";
import { ApiResponse } from "../../utils/types";
import { MESSAGES } from "../../constants/messages";
import { sendError, sendSuccess } from "../../utils/http";
import { formatHolding, parseRequest, uuidParamsSchema } from "./shared";

// Lists the holdings for a portfolio in exchange and category order.
const getPortfolioHoldings = async (req: Request, res: Response<ApiResponse>) => {
  const paramsParsed = parseRequest(uuidParamsSchema, req.params);

  if (!paramsParsed.success) {
    return sendError(req, res, 400, paramsParsed.message, "INVALID_INPUT", paramsParsed.details);
  }

  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { id: paramsParsed.data.id } });

    if (!portfolio) {
      return sendError(req, res, 404, MESSAGES.PORTFOLIO_NOT_FOUND, "PORTFOLIO_NOT_FOUND");
    }

    const holdings = await prisma.holdings.findMany({
      where: { portfolioId: paramsParsed.data.id },
      orderBy: [{ exchange: "asc" }, { asset_category: "asc" }, { holding_name: "asc" }],
      select: {
        holding_name: true,
        holding_units: true,
        holding_value: true,
        exchange: true,
        asset_category: true,
      },
    });

    return sendSuccess(res, 200, MESSAGES.HOLDINGS_FETCHED, holdings.map(formatHolding));
  } catch (_error) {
    return sendError(req, res, 500, MESSAGES.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
  }
};

export {
  getPortfolioHoldings,
};