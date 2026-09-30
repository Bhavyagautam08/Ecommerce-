import express from "express";
import * as orderController from "../controllers/order.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleChecker from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validation/order.validation.js";

const orderRouter = express.Router();
const adminOrderRouter = express.Router();

// User order routes
orderRouter.post("/", validate(createOrderSchema), authMiddleware, orderController.createOrder);
orderRouter.get("/", authMiddleware, orderController.getUserOrders);
orderRouter.get("/:orderId", authMiddleware, orderController.getOrderById);
orderRouter.patch("/:orderId/cancel", authMiddleware, orderController.cancelOrder);

// Admin order routes
adminOrderRouter.get("/", authMiddleware, roleChecker("admin"), orderController.getAllOrders);
adminOrderRouter.patch("/:orderId/status", validate(updateOrderStatusSchema), authMiddleware, roleChecker("admin"), orderController.updateOrderStatus);

export { orderRouter, adminOrderRouter };
