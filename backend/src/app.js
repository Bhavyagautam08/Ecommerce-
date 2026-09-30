import express from "express";
import healthRouter from "./routes/health.routes.js";
import morgan from "morgan";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/not-found.middleware.js";
import connectDB from "./config/database.js";
import loginRouter from "./routes/auth.routes.js"
import { loginSchema, registerSchema } from "./validation/auth.validation.js";
import validate from "./middlewares/validate.middleware.js";
import registerRouter from "./routes/register.routes.js"
import { connectRedis } from "./config/redis.js";
import adminRouter from "./routes/admin.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import { orderRouter, adminOrderRouter } from "./routes/order.routes.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
    })
);
connectDB();
connectRedis();

app.use("/api/v1", healthRouter);
app.use("/api/v1" ,  registerRouter)
app.use("/api/v1/auth" ,loginRouter)
app.use("/api/v1/admin" , adminRouter) 
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/admin/orders", adminOrderRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;