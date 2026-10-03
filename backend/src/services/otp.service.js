import redisClient from "../config/redis.js";
import { sendEmail } from "./email.service.js";

const OTP_EXPIRATION = 300; // 5 minutes

export const generateOTP = async (email, userData) => {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const key = `otp:${email}`;
    const value = { otp, userData };
    
    await redisClient.set(key, value, { ex: OTP_EXPIRATION });
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; text-align: center; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #333;">Welcome to MAREN</h2>
            <p style="color: #666; font-size: 16px;">Here is your one-time verification code. It is valid for 5 minutes.</p>
            <div style="margin: 20px auto; padding: 15px; background: #f4f4f4; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #111;">
                ${otp}
            </div>
            <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
    `;

    // Try to send email, but don't crash if SMTP is not fully set up yet
    try {
        await sendEmail(email, "Your Verification Code - MAREN", htmlContent);
    } catch (err) {
        console.error("Email dispatch failed:", err.message);
    }
    
    return otp;
};

export const verifyOTP = async (email, providedOtp) => {
    const key = `otp:${email}`;
    const dataString = await redisClient.get(key);
    
    if (!dataString) {
        return null;
    }
    
    const data = typeof dataString === "string"
        ? JSON.parse(dataString)
        : dataString;
    if (data.otp === providedOtp) {
        await redisClient.del(key); // OTP should be one-time use
        return data.userData;
    }
    
    return null;
};
