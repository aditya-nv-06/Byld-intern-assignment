import { Router } from "express";
import {
    buyHolding,
    createPortfolio,
    getPortfolioHoldings,
    getPortfolioSummary,
    sellHolding,
} from "../controllers/portfolio";

import {
    createPriceAlert,
    listPriceAlerts,
    deletePriceAlert,
} from "../controllers/alerts.controller";

const api_router = Router();

api_router.post("/v1/portfolios", createPortfolio);
api_router.get("/v1/portfolios/:id", getPortfolioSummary);
api_router.post("/v1/portfolios/:id/transactions/buy", buyHolding);
api_router.post("/v1/portfolios/:id/transactions/sell", sellHolding);
api_router.get("/v1/portfolios/:id/holdings", getPortfolioHoldings);

// Price alert routes
api_router.post("/v1/portfolios/:id/alerts", createPriceAlert);
api_router.get("/v1/portfolios/:id/alerts", listPriceAlerts);
api_router.delete("/v1/portfolios/:id/alerts/:alertId", deletePriceAlert);

export {
    api_router
}