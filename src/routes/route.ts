import { Router } from "express";
import {
    buyHolding,
    createPortfolio,
    getPortfolioHoldings,
    getPortfolioSummary,
    sellHolding,
} from "../controllers/portfolio";

const api_router = Router();

api_router.post("/v1/portfolios", createPortfolio);
api_router.get("/v1/portfolios/:id", getPortfolioSummary);
api_router.post("/v1/portfolios/:id/transactions/buy", buyHolding);
api_router.post("/v1/portfolios/:id/transactions/sell", sellHolding);
api_router.get("/v1/portfolios/:id/holdings", getPortfolioHoldings);

export {
    api_router
}