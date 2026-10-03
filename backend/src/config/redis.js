import { REDIS_ENABLED, REDIS_URL } from "./env.js";
import { createClient } from "redis";

if (REDIS_ENABLED && !REDIS_URL) {
    throw new Error("REDIS_URL must be configured");
}

const redisClient = REDIS_URL
    ? createClient({ url: REDIS_URL })
    : createClient();
redisClient.on("error", (error) => {
    console.error("Redis client error:", error.message);
});

export const connectRedis = async () => {
    if (!REDIS_ENABLED) {
        console.log("Redis disabled by REDIS_ENABLED=false.");
        return;
    }

    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    console.log("Redis connected successfully.");
};

export default redisClient;