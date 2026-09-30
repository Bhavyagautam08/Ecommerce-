import express from "express";
import * as cartController from "../controllers/cart.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { addItemSchema, updateItemSchema, removeItemSchema } from "../validation/cart.validation.js";

const router = express.Router();

router.get("/", authMiddleware, cartController.getCart);
router.post("/items", validate(addItemSchema), authMiddleware, cartController.addItem);
router.patch("/items/:productId", validate(updateItemSchema), authMiddleware, cartController.updateItem);
router.delete("/items/:productId", validate(removeItemSchema, "params"), authMiddleware, cartController.removeItem);
router.delete("/", authMiddleware, cartController.clearCart);

export default router;
