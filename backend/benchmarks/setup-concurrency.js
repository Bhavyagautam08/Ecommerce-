import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../src/models/product.model.js";

dotenv.config();

try {
    const productId = process.env.CONCURRENCY_PRODUCT_ID;
    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new Error(
            "Set CONCURRENCY_PRODUCT_ID to the exact test product ObjectId."
        );
    }

    await mongoose.connect(process.env.MONGO_URI);

    const product = await Product.findByIdAndUpdate(
        productId,
        { $set: { stock: 1 } },
        { new: true }
    );
    if (!product) {
        throw new Error(`Product ${productId} was not found.`);
    }

    console.log("Test product:");
    console.log("ID:", product._id.toString());
    console.log("Stock:", product.stock);

    await mongoose.disconnect();
} catch (error) {
    console.error(`Could not prepare concurrency product: ${error.message}`);
    process.exitCode = 1;
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
}