import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization header is missing."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token is missing."
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            ...decoded,
            id: decoded.userID || decoded.id || decoded._id
        };

        next();

    } catch (err) {
        console.log("Error:", err.message);
        next(err);
    }
};

export default authMiddleware;