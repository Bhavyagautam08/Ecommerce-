import redisClient from "../config/redis.js";

const REFRESH_TOKEN_EXP = 30 * 24 * 60 * 60;
const KEY_PREFIX = "refresh_token:";

export const storeRefreshToken = async (userId, refreshToken) => {
    const key = `${KEY_PREFIX}${userId}`;
    await redisClient.set(key, refreshToken, {
        EX: REFRESH_TOKEN_EXP
    });
};

export const getRefreshToken = async (userId) => {
    const key = `${KEY_PREFIX}${userId}`;
    return await redisClient.get(key);
};