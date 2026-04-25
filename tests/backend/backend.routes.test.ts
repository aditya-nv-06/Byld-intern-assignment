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
    priceAlert: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../../src/database/primaClient", () => ({
  prisma: prismaMock,
}));

vi.mock("../../src/jobs/webhookScheduler", () => ({
  initializeWebhookJobScheduler: vi.fn(),
  stopWebhookJobScheduler: vi.fn(),
}));

import { createApp } from "../../src/app";

describe("backend routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for invalid portfolio payload", async () => {
    const response = await request(app)
      .post("/v1/portfolios")
      .send({ clientName: "", riskProfile: "LOW" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe("INVALID_INPUT");
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it("returns validation error for invalid alert payload", async () => {
    const response = await request(app)
      .post("/v1/portfolios/550e8400-e29b-41d4-a716-446655440000/alerts")
      .send({ symbol: "", kind: "UP", price: -10, webhookUrl: "not-a-url" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errorCode).toBe("VALIDATION_ERROR");
    expect(Array.isArray(response.body.details)).toBe(true);
  });
});
