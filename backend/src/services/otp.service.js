import redisClient from "../config/redis.js";

const OTP_EXPIRATION = 300; // 5 minutes

export const generateOTP = async (email, userData) => {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const key = `otp:${email}`;
    const value = JSON.stringify({ otp, userData });
    
    await redisClient.set(key, value, { EX: OTP_EXPIRATION });
    
    return otp;
};

export const verifyOTP = async (email, providedOtp) => {
    const key = `otp:${email}`;
    const dataString = await redisClient.get(key);
    
    if (!dataString) {
        return null;
    }
    
    const data = JSON.parse(dataString);
    if (data.otp === providedOtp) {
        await redisClient.del(key); // OTP should be one-time use
        return data.userData;
    }
    
    return null;
};
