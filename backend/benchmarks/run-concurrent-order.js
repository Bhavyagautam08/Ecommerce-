import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { MONGO_URI, PORT } from "../src/config/env.js";
import Cart from "../src/models/cart.model.js";
import Product from "../src/models/product.model.js";
import User from "../src/models/user.model.js";
import { generateAccessToken } from "../src/utils/token.js";

const productId = "6abd17027419bf45acf9bc8c";
const baseUrl =
    process.env.ORDER_TEST_BASE_URL || `http://127.0.0.1:${PORT}`;

const main = async () => {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI must be configured in the backend environment");
    }

    await mongoose.connect(MONGO_URI);

    let tokens;

    try {
        const product = await Product.findById(productId).select("stock");
        if (!product) {
            throw new Error(`Product ${productId} was not found`);
        }

        if (product.stock === 0 && process.env.ORDER_TEST_RESET_STOCK === "1") {
            product.stock = 1;
            await product.save();
        } else if (product.stock !== 1) {
            throw new Error(
                `Product stock is ${product.stock}. Set it to 1 before testing; ` +
                "to reset a zero stock value for this test, run with ORDER_TEST_RESET_STOCK=1."
            );
        }

        const runId = randomUUID();
        tokens = [];

        for (let index = 0; index < 2; index++) {
            const user = await User.create({
                name: `Inventory Test ${runId.slice(0, 8)} ${index + 1}`,
                email: `inventory-test-${runId}-${index + 1}@example.invalid`,
                age: 30,
                gender: "not to say",
                password: await bcrypt.hash(randomUUID(), 8),
                role: "user"
            });

            await Cart.create({
                user: user._id,
                items: [{ product: product._id, quantity: 1 }]
            });

            tokens.push(generateAccessToken(user._id, user.role));
        }

        console.log(
            `Prepared two separate test-user carts for product ${productId} at stock ${product.stock}.`
        );
    } finally {
        await mongoose.disconnect();
    }

    const result = spawnSync(
        process.execPath,
        ["benchmarks/concurrent-order.js"],
        {
            cwd: process.cwd(),
            encoding: "utf8",
            env: {
                ...process.env,
                ORDER_TEST_BASE_URL: baseUrl,
                ORDER_TEST_TOKEN_1: tokens[0],
                ORDER_TEST_TOKEN_2: tokens[1]
            },
            maxBuffer: 4 * 1024 * 1024
        }
    );

    if (result.stdout) {
        process.stdout.write(result.stdout);
    }
    if (result.stderr) {
        process.stderr.write(result.stderr);
    }
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        process.exitCode = result.status ?? 1;
    }
};

main().catch((error) => {
    console.error(`Could not prepare or run concurrent order test: ${error.message}`);
    process.exitCode = 1;
});
