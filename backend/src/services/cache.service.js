import { REDIS_ENABLED } from "../config/env.js";
import redisClient from "../config/redis.js";

const TTL = 30 * 60;

let cacheHits = 0;
let cacheMisses = 0;

export const getCache = async (key) => {
    const isProductListingCache = key.startsWith("products:");

    if (!REDIS_ENABLED) {
        if (isProductListingCache) {
            cacheMisses++;
        }
        return null;
    }

    const cachedData = await redisClient.get(key);

    if (!cachedData) {
        if (isProductListingCache) {
            cacheMisses++;
        }
        return null;
    }

    if (isProductListingCache) {
        cacheHits++;
    }
    return JSON.parse(cachedData);
};

export const setCache = async (key, value) => {
    if (!REDIS_ENABLED) {
        return;
    }

    await redisClient.set(
        key,
        JSON.stringify(value),
        {
            EX: TTL
        }
    );
};

export const deleteCache = async (key) => {
    if (!REDIS_ENABLED) {
        return;
    }

    await redisClient.del(key);
};

export const invalidateProductCache = async () => {
    if (!REDIS_ENABLED) {
        return;
    }

    const keys = await redisClient.keys("products:*");

    if (keys.length > 0) {
        await redisClient.del(keys);
    }
};

export const getCacheStats = () => {
    const total = cacheHits + cacheMisses;

    return {
        hits: cacheHits,
        misses: cacheMisses,
        total,
        hitRate: total === 0 ? 0 : Number(((cacheHits / total) * 100).toFixed(2)),
        missRate: total === 0 ? 0 : Number(((cacheMisses / total) * 100).toFixed(2))
    };
};