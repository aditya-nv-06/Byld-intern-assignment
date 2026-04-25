import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { processWebhookAlerts } from "../../src/jobs/webhookScheduler";
import { prisma } from "../../src/database/primaClient";
import { getPriceForSymbol, shouldFireAlert } from "../../src/utils/priceFeed";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("../../src/database/primaClient", () => ({
  prisma: {
    priceAlert: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../src/utils/priceFeed", () => ({
  getPriceForSymbol: vi.fn(),
  shouldFireAlert: vi.fn(),
}));

describe("webhook scheduler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("fires webhook and marks alert inactive when condition is met", async () => {
    const alerts = [
      {
        id: "alert-1",
        symbol: "RELIANCE",
        kind: "ABOVE",
        targetPrice: 300000n,
        webhookUrl: "https://webhook.site/test",
        portfolio: {
          id: "portfolio-1",
          portfolio_name: "Demo Portfolio",
        },
      },
    ];

    vi.mocked(prisma.priceAlert.findMany).mockResolvedValueOnce(alerts as never);
    vi.mocked(getPriceForSymbol).mockReturnValueOnce({
      symbol: "RELIANCE",
      price: 305000n,
      timestamp: new Date(),
    });
    vi.mocked(shouldFireAlert).mockReturnValueOnce(true);
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200 } as never);

    await processWebhookAlerts();

    expect(prisma.priceAlert.findMany).toHaveBeenCalledWith({
      where: { status: "ACTIVE" },
      include: { portfolio: true },
    });
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(prisma.priceAlert.update).toHaveBeenCalledTimes(1);
    expect(prisma.priceAlert.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "alert-1" },
        data: expect.objectContaining({
          status: "INACTIVE",
          firedAt: expect.any(Date),
        }),
      })
    );
  });

  it("does not fire webhook when condition is not met", async () => {
    const alerts = [
      {
        id: "alert-2",
        symbol: "TCS",
        kind: "BELOW",
        targetPrice: 300000n,
        webhookUrl: "https://webhook.site/test",
        portfolio: {
          id: "portfolio-2",
          portfolio_name: "Second Portfolio",
        },
      },
    ];

    vi.mocked(prisma.priceAlert.findMany).mockResolvedValueOnce(alerts as never);
    vi.mocked(getPriceForSymbol).mockReturnValueOnce({
      symbol: "TCS",
      price: 350000n,
      timestamp: new Date(),
    });
    vi.mocked(shouldFireAlert).mockReturnValueOnce(false);

    await processWebhookAlerts();

    expect(axios.post).not.toHaveBeenCalled();
    expect(prisma.priceAlert.update).not.toHaveBeenCalled();
  });

  it("retries webhook and does not inactivate when delivery fails", async () => {
    vi.useFakeTimers();

    const alerts = [
      {
        id: "alert-3",
        symbol: "INFY",
        kind: "ABOVE",
        targetPrice: 150000n,
        webhookUrl: "https://webhook.site/unreachable",
        portfolio: {
          id: "portfolio-3",
          portfolio_name: "Third Portfolio",
        },
      },
    ];

    vi.mocked(prisma.priceAlert.findMany).mockResolvedValueOnce(alerts as never);
    vi.mocked(getPriceForSymbol).mockReturnValueOnce({
      symbol: "INFY",
      price: 180000n,
      timestamp: new Date(),
    });
    vi.mocked(shouldFireAlert).mockReturnValueOnce(true);
    vi.mocked(axios.post).mockRejectedValue(new Error("Network error"));

    const processingPromise = processWebhookAlerts();
    await vi.runAllTimersAsync();
    await processingPromise;

    expect(axios.post).toHaveBeenCalledTimes(3);
    expect(prisma.priceAlert.update).not.toHaveBeenCalled();
  });
});
