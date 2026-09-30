import redisClient from "../config/redis.js";

const TTL = 30 * 60; // 30min 


export const getCache = async (key) => {
    const cachedData = await redisClient.get(key);

    if (!cachedData) {
        return null;
    }

    return JSON.parse(cachedData);
};


export const setCache = async (key, value) => {
    await redisClient.set(
        key,
        JSON.stringify(value),
        {
            EX: TTL
        }
    );
};


export const deleteCache = async (key) => {
    await redisClient.del(key);
};


export const invalidateProductCache = async () => {
    const keys = await redisClient.keys("products:*");

    if (keys.length > 0) {
        await redisClient.del(keys);
    }
};