import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/primaClient";
import { sendSuccess, sendError } from "../utils/http";
import Decimal from "decimal.js";

const CENTS_FACTOR = 100;

/**
 * Schema for creating a price alert
 * Expects price in rupees, which will be converted to paise (BigInt)
 */
const createPriceAlertSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  kind: z.enum(["ABOVE", "BELOW"]),
  price: z.number().positive(),
  webhookUrl: z.string().url(),
});

type CreatePriceAlertRequest = z.infer<typeof createPriceAlertSchema>;

/**
 * POST /v1/portfolios/:id/alerts
 * Create a new price alert for a portfolio.
 *
 * Request body:
 * {
 *   "symbol": "RELIANCE",
 *   "kind": "ABOVE",
 *   "price": 3000.50,
 *   "webhookUrl": "https://webhook.site/your-unique-id"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "statusCode": 201,
 *   "message": "Price alert created successfully",
 *   "data": { "id": "...", "symbol": "RELIANCE", ... }
 * }
 */
export const createPriceAlert = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Parse and validate request body
    const parsed = createPriceAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      sendError(
        req,
        res,
        400,
        "Invalid price alert data",
        "VALIDATION_ERROR",
        details
      );
      return;
    }

    const { symbol, kind, price, webhookUrl } =
      parsed.data as CreatePriceAlertRequest;
    const portfolioId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Check if portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      sendError(
        req,
        res,
        404,
        "Portfolio not found",
        "PORTFOLIO_NOT_FOUND",
        [`Portfolio with ID ${portfolioId} does not exist`]
      );
      return;
    }

    // Convert price from rupees to paise
    const targetPriceInPaise = BigInt(
      new Decimal(price).mul(CENTS_FACTOR).toDecimalPlaces(0).toString()
    );

    // Create price alert in database
    const alert = await prisma.priceAlert.create({
      data: {
        symbol,
        kind: kind as "ABOVE" | "BELOW",
        targetPrice: targetPriceInPaise,
        webhookUrl,
        portfolioId,
      },
    });

    req.log.info(
      {
        alertId: alert.id,
        symbol,
        kind,
        priceInRupees: price,
        portfolioId,
      },
      "Price alert created"
    );

    sendSuccess(res, 201, "Price alert created successfully", {
      id: alert.id,
      symbol: alert.symbol,
      kind: alert.kind,
      price: Number(alert.targetPrice) / CENTS_FACTOR,
      webhookUrl: alert.webhookUrl,
      status: alert.status,
      createdAt: alert.createdAt,
    });
  } catch (error) {
    req.log.error(error, "Error creating price alert");
    sendError(
      req,
      res,
      500,
      "Internal server error",
      "INTERNAL_SERVER_ERROR",
      ["An unexpected error occurred while creating the price alert"]
    );
  }
};

/**
 * GET /v1/portfolios/:id/alerts
 * List all price alerts for a portfolio
 */
export const listPriceAlerts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const portfolioId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Check if portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      sendError(
        req,
        res,
        404,
        "Portfolio not found",
        "PORTFOLIO_NOT_FOUND",
        [`Portfolio with ID ${portfolioId} does not exist`]
      );
      return;
    }

    // Fetch all alerts for portfolio
    const alerts = await prisma.priceAlert.findMany({
      where: { portfolioId },
      orderBy: { createdAt: "desc" },
    });

    req.log.info(
      { portfolioId, count: alerts.length },
      "Price alerts listed"
    );

    sendSuccess(res, 200, "Price alerts retrieved successfully", {
      alerts: alerts.map((alert) => ({
        id: alert.id,
        symbol: alert.symbol,
        kind: alert.kind,
        price: Number(alert.targetPrice) / CENTS_FACTOR,
        webhookUrl: alert.webhookUrl,
        status: alert.status,
        firedAt: alert.firedAt,
        createdAt: alert.createdAt,
      })),
    });
  } catch (error) {
    req.log.error(error, "Error listing price alerts");
    sendError(
      req,
      res,
      500,
      "Internal server error",
      "INTERNAL_SERVER_ERROR",
      ["An unexpected error occurred while listing price alerts"]
    );
  }
};

/**
 * DELETE /v1/portfolios/:id/alerts/:alertId
 * Delete a price alert
 */
export const deletePriceAlert = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const portfolioId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const alertId = Array.isArray(req.params.alertId) ? req.params.alertId[0] : req.params.alertId;

    // Check if alert exists and belongs to portfolio
    const alert = await prisma.priceAlert.findFirst({
      where: {
        id: alertId,
        portfolioId,
      },
    });

    if (!alert) {
      sendError(
        req,
        res,
        404,
        "Price alert not found",
        "ALERT_NOT_FOUND",
        [
          `Alert with ID ${alertId} not found for portfolio ${portfolioId}`,
        ]
      );
      return;
    }

    // Delete alert
    await prisma.priceAlert.delete({
      where: { id: alertId },
    });

    req.log.info({ alertId, portfolioId }, "Price alert deleted");

    sendSuccess(
      res,
      200,
      "Price alert deleted successfully",
      { id: alertId }
    );
  } catch (error) {
    req.log.error(error, "Error deleting price alert");
    sendError(
      req,
      res,
      500,
      "Internal server error",
      "INTERNAL_SERVER_ERROR",
      ["An unexpected error occurred while deleting the price alert"]
    );
  }
};
