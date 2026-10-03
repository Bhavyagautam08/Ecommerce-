import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MONGO_URI } from "../src/config/env.js";
import Cart from "../src/models/cart.model.js";
import Order from "../src/models/order.model.js";
import Product from "../src/models/product.model.js";

const productId = "6abd17027419bf45acf9bc8c";
const baseUrl = process.env.ORDER_TEST_BASE_URL || "http://127.0.0.1:5000";
const tokens = [
    process.env.ORDER_TEST_TOKEN_1,
    process.env.ORDER_TEST_TOKEN_2
];

const getUserIdFromToken = (token, requestNumber) => {
    if (!token) {
        throw new Error(
            `ORDER_TEST_TOKEN_${requestNumber} must contain a raw access JWT`
        );
    }

    const decoded = jwt.decode(token);
    const userId = decoded && typeof decoded === "object"
        ? decoded.userID || decoded.id || decoded._id
        : null;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        throw new Error(
            `ORDER_TEST_TOKEN_${requestNumber} must be a valid access JWT containing a user ID`
        );
    }

    return new mongoose.Types.ObjectId(userId);
};

const ensureTestCarts = async (userIds) => {
    const carts = await Cart.find({ user: { $in: userIds } }).lean();

    for (const userId of userIds) {
        const cart = carts.find((entry) => entry.user.toString() === userId.toString());
        const items = cart?.items || [];
        const hasExpectedCart =
            items.length === 1 &&
            items[0].product.toString() === productId &&
            items[0].quantity === 1;

        if (!hasExpectedCart) {
            throw new Error(
                `Test user ${userId} must have a cart containing only product ${productId} with quantity 1. ` +
                "Prepare both dedicated test-user carts before running the test."
            );
        }
    }
};

const sendOrder = async (requestNumber, token, shippingAddress, idempotencyKey) => {
    const startedAt = Date.now();

    try {
        const response = await fetch(`${baseUrl}/api/v1/orders`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${token}`,
                "Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify({ shippingAddress })
        });
        const responseText = await response.text();
        let responseBody = responseText;

        if (responseText) {
            try {
                responseBody = JSON.parse(responseText);
            } catch {
                // Keep non-JSON response bodies printable as text.
            }
        }

        return {
            requestNumber,
            status: response.status,
            responseBody,
            responseTimeMs: Date.now() - startedAt
        };
    } catch (error) {
        return {
            requestNumber,
            status: "NETWORK_ERROR",
            responseBody: { message: error.message },
            responseTimeMs: Date.now() - startedAt
        };
    }
};

const main = async () => {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI must be configured in the backend environment");
    }

    const userIds = tokens.map((token, index) =>
        getUserIdFromToken(token, index + 1)
    );
    if (userIds[0].equals(userIds[1])) {
        throw new Error("The two access tokens must belong to different users");
    }

    await mongoose.connect(MONGO_URI);

    try {
        const product = await Product.findById(productId).select("stock");
        if (!product) {
            throw new Error(`Product ${productId} was not found`);
        }
        if (product.stock !== 1) {
            throw new Error(
                `Expected product stock to be 1 before the test; found ${product.stock}. Reset it before running.`
            );
        }

        await ensureTestCarts(userIds);

        const runId = randomUUID();
        const shippingAddress = {
            fullName: "Test User",
            phone: "9876543210",
            addressLine: `123 Test Street [inventory-concurrency:${runId}]`,
            pincode: "440001",
            city: "Nagpur",
            state: "Maharashtra"
        };
        const productObjectId = new mongoose.Types.ObjectId(productId);
        const startedAt = new Date();

        console.log(`Product ${productId}: initial stock ${product.stock}`);
        console.log("Sending exactly two order requests concurrently...\n");

        const results = await Promise.all([
            sendOrder(1, tokens[0], shippingAddress, randomUUID()),
            sendOrder(2, tokens[1], shippingAddress, randomUUID())
        ]);
        const finishedAt = new Date();

        for (const result of results) {
            console.log(`Request ${result.requestNumber}:`);
            console.log(`  HTTP status: ${result.status}`);
            console.log(`  Response time: ${result.responseTimeMs} ms`);
            console.log(`  Response body: ${JSON.stringify(result.responseBody, null, 2)}`);
        }

        const finalProduct = await Product.findById(productObjectId).select("stock");
        const testOrders = await Order.find({
            user: { $in: userIds },
            "shippingAddress.addressLine": shippingAddress.addressLine,
            items: {
                $elemMatch: {
                    product: productObjectId,
                    quantity: 1
                }
            }
        }).select("_id user items createdAt");
        const finalStock = finalProduct?.stock ?? null;
        const stockIsValid = finalStock === 0;
        const stockIsNonnegative = finalStock !== null && finalStock >= 0;
        const successfulResponses = results.filter((result) => result.status === 201);
        const stockRejections = results.filter(
            (result) =>
                result.status === 400 &&
                /insufficient stock/i.test(result.responseBody?.message || "")
        );
        const passed =
            successfulResponses.length === 1 &&
            stockRejections.length === 1 &&
            testOrders.length === 1 &&
            stockIsValid &&
            stockIsNonnegative;

        console.log("\nDatabase verification:");
        console.log(`  Test run started: ${startedAt.toISOString()}`);
        console.log(`  Test run finished: ${finishedAt.toISOString()}`);
        console.log(`  Final stock: ${finalStock}`);
        console.log(`  New orders for this test: ${testOrders.length}`);
        console.log(`  Successful order responses: ${successfulResponses.length}`);
        console.log(`  Insufficient-stock rejections: ${stockRejections.length}`);
        console.log(`\n${passed ? "PASS" : "FAIL"}: ${passed
            ? "one order was created, one request was rejected, and stock is zero."
            : "the observed requests or database state did not match the expected concurrency result."}`);

        if (!passed) {
            process.exitCode = 1;
        }
    } finally {
        await mongoose.disconnect();
    }
};

main().catch((error) => {
    console.error(`Concurrent order test could not run: ${error.message}`);
    process.exitCode = 1;
});
