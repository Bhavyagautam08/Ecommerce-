import { Redis } from "@upstash/redis";
import {
    REDIS_ENABLED,
    REDIS_URL,
    UPSTASH_REDIS_REST_TOKEN,
} from "./env.js";

if (REDIS_ENABLED && (!REDIS_URL || !UPSTASH_REDIS_REST_TOKEN)) {
    throw new Error(
        "UPSTASH_REDIS_REST_URL (or REDIS_URL) and UPSTASH_REDIS_REST_TOKEN must be configured when Redis is enabled"
    );
}

if (REDIS_ENABLED && new URL(REDIS_URL).protocol !== "https:") {
    throw new Error(
        "The Upstash Redis REST URL must use HTTPS; configure UPSTASH_REDIS_REST_URL"
    );
}

const redisClient = new Redis({
    url: REDIS_URL || "http://127.0.0.1",
    token: UPSTASH_REDIS_REST_TOKEN || "",
});

export const connectRedis = async () => {
    if (!REDIS_ENABLED) {
        console.log("Redis disabled by REDIS_ENABLED=false.");
        return;
    }

    try {
        await redisClient.ping();
    } catch (error) {
        throw new Error(`Upstash Redis connection check failed: ${error.message}`);
    }
    console.log("Upstash Redis connected successfully.");
};

export const scanKeys = async (pattern) => {
    const keys = [];
    let cursor = "0";

    do {
        const result = await redisClient.scan(cursor, {
            match: pattern,
            count: 250
        });
        cursor = String(result[0]);
        keys.push(...result[1]);
    } while (cursor !== "0");

    return keys;
};

export default redisClient;