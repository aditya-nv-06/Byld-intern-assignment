import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    portfolio: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    holdings: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../../src/database/primaClient", () => ({
  prisma: prismaMock,
}));

import { createApp } from "../../src/app";

describe("portfolio routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns structured validation error for invalid create payload", async () => {
    const response = await request(app)
      .post("/v1/portfolios")
      .send({ clientName: "", riskProfile: "LOW" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe("INVALID_INPUT");
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it("returns not found when buying for unknown portfolio", async () => {
    prismaMock.portfolio.findUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/v1/portfolios/550e8400-e29b-41d4-a716-446655440000/transactions/buy")
      .send({
        symbol: "RELIANCE",
        exchange: "NSE",
        assetCategory: "STOCKS",
        quantity: 2,
        price: 2984.25,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe("PORTFOLIO_NOT_FOUND");
  });
});