import { randomUUID } from "node:crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MONGO_URI, PORT } from "../src/config/env.js";
import Cart from "../src/models/cart.model.js";
import Order from "../src/models/order.model.js";
import Product from "../src/models/product.model.js";
import User from "../src/models/user.model.js";
import { generateAccessToken } from "../src/utils/token.js";

dotenv.config();

const baseUrl =
    process.env.INVENTORY_TEST_BASE_URL || `http://127.0.0.1:${PORT}`;
const concurrencyLevels = [2, 10, 25, 50, 100];

const sendOrder = async (requestNumber, token, addressLine) => {
    const startedAt = performance.now();

    try {
        const response = await fetch(`${baseUrl}/api/v1/orders`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${token}`,
                "Idempotency-Key": randomUUID()
            },
            body: JSON.stringify({
                shippingAddress: {
                    fullName: `Inventory Race User ${requestNumber}`,
                    phone: "9876543210",
                    addressLine,
                    pincode: "440001",
                    city: "Nagpur",
                    state: "Maharashtra"
                }
            })
        });
        const responseText = await response.text();
        let responseBody;

        try {
            responseBody = JSON.parse(responseText);
        } catch {
            responseBody = responseText;
        }

        return {
            requestNumber,
            status: response.status,
            responseBody,
            elapsedMs: Number((performance.now() - startedAt).toFixed(2))
        };
    } catch (error) {
        return {
            requestNumber,
            status: "NETWORK_ERROR",
            responseBody: { message: error.message },
            elapsedMs: Number((performance.now() - startedAt).toFixed(2))
        };
    }
};

const prepareRace = async (concurrency) => {
    const runId = randomUUID();
    const product = await Product.create({
        name: `Inventory Race Test ${concurrency} ${runId}`,
        description: `Temporary benchmark item for a ${concurrency}-request stock race.`,
        price: 1,
        images: [],
        category: "Benchmark",
        stock: 1,
        brand: "MAREN BENCHMARK",
        isActive: true
    });
    const password = randomUUID();
    const users = Array.from({ length: concurrency }, (_, index) => ({
        name: `Inventory Race ${concurrency} ${index + 1}`,
        email: `inventory-race-${runId}-${index + 1}@example.invalid`,
        age: 30,
        gender: "not to say",
        password,
        role: "user"
    }));
    const createdUsers = await User.insertMany(users, { ordered: true });
    const carts = createdUsers.map((user) => ({
        user: user._id,
        items: [{ product: product._id, quantity: 1 }]
    }));

    await Cart.insertMany(carts, { ordered: true });

    return {
        runId,
        productId: product._id,
        userIds: createdUsers.map((user) => user._id),
        tokens: createdUsers.map((user) =>
            generateAccessToken(user._id, user.role)
        ),
        addressLine: `Inventory race ${concurrency} ${runId}`
    };
};

const runRace = async (concurrency) => {
    const setup = await prepareRace(concurrency);
    const initialProduct = await Product.findById(setup.productId).select("stock");
    if (initialProduct?.stock !== 1) {
        throw new Error(
            `Race ${concurrency}: fresh product did not start at stock 1`
        );
    }

    const startedAt = new Date();
    const results = await Promise.all(
        setup.tokens.map((token, index) =>
            sendOrder(index + 1, token, setup.addressLine)
        )
    );
    const finishedAt = new Date();

    const finalProduct = await Product.findById(setup.productId).select("stock");
    const createdOrders = await Order.find({
        user: { $in: setup.userIds },
        "shippingAddress.addressLine": setup.addressLine,
        items: {
            $elemMatch: {
                product: setup.productId,
                quantity: 1
            }
        }
    }).select("_id user items");
    const successful = results.filter((result) => result.status === 201);
    const insufficientStock = results.filter(
        (result) =>
            result.status === 400 &&
            /insufficient stock/i.test(result.responseBody?.message || "")
    );
    const expectedPass =
        successful.length === 1 &&
        insufficientStock.length === concurrency - 1 &&
        createdOrders.length === 1 &&
        finalProduct?.stock === 0;
    const latencyTotal = results.reduce(
        (total, result) => total + result.elapsedMs,
        0
    );
    const otherStatuses = results.filter(
        (result) => result.status !== 201 && !(
            result.status === 400 &&
            /insufficient stock/i.test(result.responseBody?.message || "")
        )
    );

    console.log(`\n=== ${concurrency} CONCURRENT ORDER REQUESTS ===`);
    console.log(`Product: ${setup.productId}`);
    console.log(`Started: ${startedAt.toISOString()}`);
    console.log(`Finished: ${finishedAt.toISOString()}`);
    console.log(`HTTP 201 orders: ${successful.length}`);
    console.log(`HTTP 400 insufficient stock: ${insufficientStock.length}`);
    console.log(`Unexpected statuses/errors: ${otherStatuses.length}`);
    console.log(`Orders found for this race: ${createdOrders.length}`);
    console.log(`Final stock: ${finalProduct?.stock ?? "product missing"}`);
    console.log(
        `Request response times: avg ${(latencyTotal / results.length).toFixed(2)} ms; max ${Math.max(...results.map((result) => result.elapsedMs))} ms`
    );

    if (otherStatuses.length > 0) {
        console.log("Unexpected request results:");
        for (const result of otherStatuses) {
            console.log(
                `  Request ${result.requestNumber}: HTTP ${result.status}; ${JSON.stringify(result.responseBody)}`
            );
        }
    }

    console.log(`RESULT: ${expectedPass ? "PASS" : "FAIL"}`);

    return expectedPass;
};

const main = async () => {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI must be configured in the backend environment");
    }

    const healthResponse = await fetch(`${baseUrl}/api/v1/health`);
    if (!healthResponse.ok) {
        throw new Error(
            `Backend health check failed with HTTP ${healthResponse.status}`
        );
    }

    await mongoose.connect(MONGO_URI);
    try {
        const results = [];
        for (const concurrency of concurrencyLevels) {
            results.push(await runRace(concurrency));
        }

        const passed = results.every(Boolean);
        console.log("\n===== INVENTORY CONCURRENCY SUITE =====");
        console.log(`Cases passed: ${results.filter(Boolean).length}/${results.length}`);
        console.log(`Overall: ${passed ? "PASS" : "FAIL"}`);

        if (!passed) {
            process.exitCode = 1;
        }
    } finally {
        await mongoose.disconnect();
    }
};

main().catch((error) => {
    console.error(`Inventory concurrency suite failed: ${error.message}`);
    process.exitCode = 1;
});
