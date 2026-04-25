import cron from "node-cron";
import axios from "axios";
import { prisma } from "../database/primaClient";
import { getPriceForSymbol, shouldFireAlert } from "../utils/priceFeed";
import pino from "pino";

const logger = pino();

/**
 * Initialize and start the webhook job scheduler.
 * Runs every 30 seconds, checking all active alerts against current prices.
 */
export const initializeWebhookJobScheduler = (): void => {
  // Run every 30 seconds: */30 * * * * *
  cron.schedule("*/30 * * * * *", async () => {
    await processWebhookAlerts();
  });

  logger.info("Webhook job scheduler initialized (runs every 30 seconds)");
};

/**
 * Process all active alerts and fire webhooks if conditions are met.
 * This function:
 * 1. Fetches all active (ACTIVE status) alerts
 * 2. Gets current price for each symbol
 * 3. Checks if alert condition is met
 * 4. POSTs to webhook URL if fired
 * 5. Updates alert status to INACTIVE and sets firedAt timestamp (fires once)
 */
export const processWebhookAlerts = async (): Promise<void> => {
  try {
    // Fetch all active alerts
    const activeAlerts = await prisma.priceAlert.findMany({
      where: { status: "ACTIVE" },
      include: { portfolio: true },
    });

    if (activeAlerts.length === 0) {
      return; // No alerts to process
    }

    logger.debug({ count: activeAlerts.length }, "Processing price alerts");

    for (const alert of activeAlerts) {
      try {
        // Get current price for the symbol
        const priceData = getPriceForSymbol(alert.symbol);
        const currentPrice = priceData.price;

        // Check if alert condition is met
        const shouldFire = shouldFireAlert(
          currentPrice,
          alert.targetPrice,
          alert.kind
        );

        if (shouldFire) {
          // Fire the webhook
          const payload = {
            alertId: alert.id,
            symbol: alert.symbol,
            kind: alert.kind,
            targetPrice: Number(alert.targetPrice) / 100, // Convert to rupees
            currentPrice: Number(currentPrice) / 100, // Convert to rupees
            portfolio: {
              id: alert.portfolio.id,
              name: alert.portfolio.portfolio_name,
            },
            timestamp: new Date().toISOString(),
          };

          // POST to webhook URL with retry logic
          await fireWebhook(alert.webhookUrl, payload, alert.id);

          // Alert fires at most once; deactivate after successful webhook delivery.
          await prisma.priceAlert.update({
            where: { id: alert.id },
            data: {
              status: "INACTIVE",
              firedAt: new Date(),
            },
          });

          logger.info(
            {
              alertId: alert.id,
              symbol: alert.symbol,
              webhookUrl: alert.webhookUrl,
              currentPrice: Number(currentPrice) / 100,
            },
            "Price alert fired and webhook triggered"
          );
        }
      } catch (error) {
        logger.error(
          { alertId: alert.id, error },
          "Error processing individual alert"
        );
        // Continue with next alert even if one fails
      }
    }
  } catch (error) {
    logger.error(error, "Error processing webhook alerts");
  }
};

/**
 * Fire a webhook with retry logic.
 * Attempts up to 3 times with exponential backoff.
 * @param webhookUrl - URL to POST to
 * @param payload - Data to send
 * @param alertId - Alert ID for logging
 */
const fireWebhook = async (
  webhookUrl: string,
  payload: Record<string, unknown>,
  alertId: string
): Promise<void> => {
  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await axios.post(webhookUrl, payload, {
        timeout: 10000, // 10 second timeout
        headers: {
          "Content-Type": "application/json",
          "X-Alert-Id": alertId,
          "X-Timestamp": new Date().toISOString(),
        },
      });

      logger.debug(
        { alertId, webhookUrl, attempt },
        "Webhook fired successfully"
      );
      return;
    } catch (error) {
      lastError = error;
      logger.warn(
        { alertId, webhookUrl, attempt, error },
        `Webhook attempt ${attempt} failed`
      );

      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  // Log error after all retries exhausted
  logger.error(
    { alertId, webhookUrl, maxRetries, lastError },
    "Webhook failed after all retries"
  );

  throw lastError;
};

/**
 * Gracefully shut down the scheduler.
 * Used for testing and application shutdown.
 */
export const stopWebhookJobScheduler = (): void => {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  logger.info("Webhook job scheduler stopped");
};
