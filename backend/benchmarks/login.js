import autocannon from "autocannon";

const email = process.env.BENCHMARK_LOGIN_EMAIL;
const password = process.env.BENCHMARK_LOGIN_PASSWORD;

if (!email || !password) {
    throw new Error(
        "Set BENCHMARK_LOGIN_EMAIL and BENCHMARK_LOGIN_PASSWORD in your local environment."
    );
}

autocannon({
    url: "http://localhost:5000/api/v1/auth/login",
    connections: 10,
    duration: 30,
    method: "POST",

    headers: {
        "content-type": "application/json"
    },

    body: JSON.stringify({
        email,
        password
    })
}, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log("\n===== LOGIN BENCHMARK =====");

    console.log("Requests:", result.requests.total);
    console.log("Errors:", result.errors);
    console.log("Non-2xx:", result.non2xx);

    console.log("Average:", result.latency.average, "ms");
    console.log("P50:", result.latency.p50, "ms");
    console.log("P99:", result.latency.p99, "ms");
    console.log("Max:", result.latency.max, "ms");

    console.log("Requests/sec:", result.requests.average);
});