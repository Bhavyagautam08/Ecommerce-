import autocannon from "autocannon";
import { randomUUID } from "node:crypto";

const token = process.env.ORDER_BENCHMARK_TOKEN;

if (!token) {
    throw new Error("Set ORDER_BENCHMARK_TOKEN in your local environment.");
}
if (process.env.ORDER_BENCHMARK_ALLOW_ORDER_CREATION !== "true") {
    throw new Error(
        "This benchmark creates an order from the token user's cart. Set ORDER_BENCHMARK_ALLOW_ORDER_CREATION=true to continue."
    );
}

const result = await autocannon({
    url: "http://localhost:5000/api/v1/orders",
    amount: 1,
    method: "POST",
    headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Idempotency-Key": randomUUID()
    },
    body: JSON.stringify({
        shippingAddress: {
            fullName: "Benchmark User",
            phone: "9876543210",
            addressLine: "Benchmark test address",
            pincode: "440001",
            city: "Nagpur",
            state: "Maharashtra"
        }
    })
});

console.log(result);