import dotenv from "dotenv" ;

dotenv.config() ;

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI ;
const JWT_SECRET = process.env.JWT_SECRET ;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REDIS_URL = process.env.REDIS_URL;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

export { PORT, MONGO_URI , JWT_SECRET , REFRESH_TOKEN_SECRET , REDIS_URL, CLIENT_URL };