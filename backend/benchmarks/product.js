import autocannon from "autocannon";
import hdr from "hdr-histogram-js";

const urls = process.env.PRODUCT_BENCHMARK_URLS
    ? JSON.parse(process.env.PRODUCT_BENCHMARK_URLS)
    : [
        process.env.PRODUCT_BENCHMARK_URL ||
        "http://localhost:5000/api/v1/products?page=1&limit=10&sort=newest"
    ];
const duration = Number(process.env.PRODUCT_BENCHMARK_DURATION || 30);
const connections = Number(process.env.PRODUCT_BENCHMARK_CONNECTIONS || 10);
const origin = new URL(urls[0]).origin;
const cacheStatsUrl = new URL("/api/v1/products/cache-stats", origin);

const getCacheStats = async () => {
    const response = await fetch(cacheStatsUrl);
    if (!response.ok) {
        throw new Error(`Cache stats endpoint returned HTTP ${response.status}`);
    }
    return response.json();
};

const runAutocannon = () =>
    new Promise((resolve, reject) => {
        const latencyHistogram = hdr.build({
            lowestDiscernibleValue: 1,
            highestTrackableValue: 60_000,
            numberOfSignificantValueDigits: 3,
            autoResize: true
        });
        const tracker = autocannon(
            {
                url: urls,
                connections,
                duration,
                method: "GET"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }
        );
        tracker.on("response", (_client, _statusCode, _bytes, responseTime) => {
            latencyHistogram.recordValue(responseTime);
        });
        tracker.on("done", (result) => {
            result.latency.p95 = latencyHistogram.getValueAtPercentile(95);
        });
    });

const main = async () => {
    if (!Array.isArray(urls) || urls.length === 0 || urls.some((url) => typeof url !== "string")) {
        throw new Error("PRODUCT_BENCHMARK_URLS must be a non-empty JSON array of URLs");
    }
    if (urls.some((url) => new URL(url).origin !== origin)) {
        throw new Error("All PRODUCT_BENCHMARK_URLS must share the same origin");
    }
    if (connections % urls.length !== 0) {
        throw new Error(
            "Connections must be an integer multiple of URL count for even URL distribution"
        );
    }

    const cacheBefore = await getCacheStats();
    console.log("Warming each listing URL with one request...");
    for (const listingUrl of urls) {
        const response = await fetch(listingUrl);
        if (!response.ok) {
            throw new Error(`Warm-up request to ${listingUrl} returned HTTP ${response.status}`);
        }
        const body = await response.json();
        if (!Array.isArray(body.products) || !body.pagination) {
            throw new Error(`Warm-up request to ${listingUrl} returned an invalid listing response`);
        }
        console.log(`  HTTP ${response.status}: ${listingUrl}`);
    }
    const afterWarmup = await getCacheStats();
    const result = await runAutocannon();
    const cacheAfter = await getCacheStats();
    const warmupHits = afterWarmup.hits - cacheBefore.hits;
    const warmupMisses = afterWarmup.misses - cacheBefore.misses;
    const hitsDuringRun = cacheAfter.hits - afterWarmup.hits;
    const missesDuringRun = cacheAfter.misses - afterWarmup.misses;
    const totalHits = cacheAfter.hits - cacheBefore.hits;
    const totalMisses = cacheAfter.misses - cacheBefore.misses;
    const totalLookups = totalHits + totalMisses;

    console.log("\n===== PRODUCTS BENCHMARK =====");
    console.log(`URLs (${urls.length}):`);
    for (const listingUrl of urls) {
        console.log(`  ${listingUrl}`);
    }
    console.log(`Duration: ${duration} seconds`);
    console.log(`Connections: ${connections}`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Requests/sec: ${result.requests.average}`);
    console.log(`Average latency: ${result.latency.average} ms`);
    console.log(`P50 latency: ${result.latency.p50} ms`);
    console.log(`P95 latency: ${result.latency.p95} ms`);
    console.log(`P99 latency: ${result.latency.p99} ms`);
    console.log(`Max latency: ${result.latency.max} ms`);
    console.log(`Errors: ${result.errors}`);
    console.log(`Non-2xx responses: ${result.non2xx}`);
    console.log(`Product-cache hits during run: ${hitsDuringRun}`);
    console.log(`Product-cache misses during run: ${missesDuringRun}`);
    console.log(`Warm-up hits/misses: ${warmupHits}/${warmupMisses}`);
    console.log(`Total test hits/misses: ${totalHits}/${totalMisses}`);
    console.log(
        `Total test hit rate: ${totalLookups === 0 ? 0 : Number(((totalHits / totalLookups) * 100).toFixed(2))}%`
    );
    console.log(
        `Cache-mode verification: ${
            result.errors === 0 &&
            result.non2xx === 0
                ? "PASS (load responses succeeded)"
                : "FAIL (benchmark requests had errors or non-2xx responses)"
        }`
    );
};

main().catch((error) => {
    console.error(`Product benchmark failed: ${error.message}`);
    process.exitCode = 1;
});