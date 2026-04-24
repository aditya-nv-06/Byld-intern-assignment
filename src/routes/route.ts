import { Router } from "express";
import { start_portfolio } from "../controllers/portfolio";

const api_router = Router();

api_router.get("/v1/portfolio",start_portfolio);

export {
    api_router
}