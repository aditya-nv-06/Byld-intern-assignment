import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();

const server = createApp();
const port = Number(process.env.PORT) || 3000;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});