import JWT from "jsonwebtoken";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "../config/env.js";

export const generateAccessToken = (userID) => {
    return JWT.sign(
        { userID , role},
        JWT_SECRET,
        { expiresIn: "15m" }
    );
};

export const generateRefreshToken = (userID) => {
    return JWT.sign(
        { userID },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
    );
};

export const verifyRefreshToken = (refreshToken) => {
    return JWT.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET
    );
};