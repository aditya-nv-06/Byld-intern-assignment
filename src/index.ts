import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { api_router } from "./routes/route";
import { swaggerSpec } from "./docs/swagger";
import { buildLogger } from "./config/logger";

dotenv.config();

const server = express();
const port = Number(process.env.PORT) || 3000;

server.use(express.json());
server.use(cors());
server.use(buildLogger());

server.get("/api-docs.json", (_, res) => {
    return res.json(swaggerSpec);
});

server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
server.use(api_router);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});