import app from "./src/app.js" 
import dotenv from "dotenv" 
import {PORT, REDIS_ENABLED} from "./src/config/env.js";
import { connectRedis } from "./src/config/redis.js";

dotenv.config() ;

await connectRedis();

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    if (!REDIS_ENABLED) {
        console.log("Redis-backed caching and Redis-dependent features are disabled.");
    }
});