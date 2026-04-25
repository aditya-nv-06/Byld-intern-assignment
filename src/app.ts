import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { api_router } from "./routes/route";
import { swaggerSpec } from "./docs/swagger";
import { buildLogger } from "./config/logger";
import { initializeWebhookJobScheduler } from "./jobs/webhookScheduler";

const createApp = () => {
  const server = express();

  server.use(express.json());
  server.use(cors());
  server.use(buildLogger());

  // Initialize webhook job scheduler
  initializeWebhookJobScheduler();

  server.get("/api-docs.json", (_, res) => {
    return res.json(swaggerSpec);
  });

  server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  server.use(api_router);

  return server;
};

export { createApp };