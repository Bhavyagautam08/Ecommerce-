import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleChecker from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createProductSchema, productQuerySchema, updateProductSchema } from "../validation/product.validation.js";

const router = express.Router();

router.post("/", authMiddleware , roleChecker("admin") , validate(createProductSchema , "body"), createProduct);
router.get("/", validate(productQuerySchema , "query") ,getAllProducts);
router.get("/:id", getProductById);
router.patch("/:id", authMiddleware , roleChecker("admin") , validate(updateProductSchema , "body") , updateProduct);
router.delete("/:id", authMiddleware , roleChecker("admin") , deleteProduct);

export default router;