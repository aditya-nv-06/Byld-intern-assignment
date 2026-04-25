import express , {Router} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pino from 'pino-http'
import { api_router } from './routes/route';

const server = express();
const route_final = Router();

dotenv.config()

server.use(express.json())

server.use(cors())
server.use(pino());

route_final.use(api_router)

server.use(route_final);

server.listen(process.env.PORT||3000,()=>{
    console.log(`Server running in :${process.env.PORT}`)
})