import redisClient from "../config/redis.js";

const REFRESH_TOKEN_EXP = 30 * 24 * 60 * 60 ;

export const storeRefreshToken = async(userId , refreshToken) =>{
    const key = `REFRESH_KEY:${userId}` ;

    await redisClient.set(key , refreshToken ,{
        EX : REFRESH_TOKEN_EXP
    });
};

export const getRefreshToken = async (userId) => {
    const key = `refresh_token:${userId}`;

    return await redisClient.get(key);
};