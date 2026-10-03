import dotenv from "dotenv";
import autocannon from "autocannon";
import hdr from "hdr-histogram-js";
import redisClient from "../src/config/redis.js";

dotenv.config();

const baseUrl = process.env.CACHE_TEST_BASE_URL || "http://127.0.0.1:5000";
const duration = Number(process.env.CACHE_TEST_DURATION || 30);
const connections = Number(process.env.CACHE_TEST_CONNECTIONS || 10);
const coldBurstSize = Number(process.env.CACHE_TEST_COLD_BURST || 20);
const warmRequestsPerUrl = Number(process.env.CACHE_TEST_WARM_REQUESTS || 10);
const listingUrls = [
    "/api/v1/products?page=1&limit=10&sort=newest",
    "/api/v1/products?page=2&limit=10&sort=newest",
    "/api/v1/products?page=10&limit=10&sort=newest",
    "/api/v1/products?page=1&limit=10&sort=oldest",
    "/api/v1/products?page=1&limit=10&sort=newest&category=Outerwear"
].map((path) => new URL(path, baseUrl).toString());
const statsUrl = new URL(
    "/api/v1/products/cache-stats",
    baseUrl
).toString();

const getCacheStats = async () => {
    const response = await fetch(statsUrl);
    if (!response.ok) {
        throw new Error(`Cache stats endpoint returned HTTP ${response.status}`);
    }
    return response.json();
};

const fetchListing = async (url) => {
    const startedAt = performance.now();
    const response = await fetch(url);
    const text = await response.text();
    let body;

    try {
        body = JSON.parse(text);
    } catch {
        body = text;
    }

    if (!response.ok) {
        throw new Error(
            `Listing ${url} returned HTTP ${response.status}: ${JSON.stringify(body)}`
        );
    }
    if (!body || !Array.isArray(body.products)) {
        throw new Error(`Listing ${url} did not return a products array`);
    }
    if (!body.pagination || body.pagination.totalProducts < 1) {
        throw new Error(
            `Expected a non-empty product listing; got ${body.pagination?.totalProducts ?? "no total"} products`
        );
    }

    return {
        status: response.status,
        totalProducts: body.pagination.totalProducts,
        elapsedMs: Number((performance.now() - startedAt).toFixed(2))
    };
};

const clearListingCache = async () => {
    const keys = [];
    for await (const batch of redisClient.scanIterator({
        MATCH: "products:*",
        COUNT: 250
    })) {
        for (const key of batch) {
            if (typeof key === "string") {
                keys.push(key);
            }
        }
    }
    if (keys.length) {
        await redisClient.del(keys);
    }
    return keys.length;
};

const runLoad = () =>
    new Promise((resolve, reject) => {
        const latencyHistogram = hdr.build({
            lowestDiscernibleValue: 1,
            highestTrackableValue: 60_000,
            numberOfSignificantValueDigits: 3,
            autoResize: true
        });
        const tracker = autocannon(
            {
                url: listingUrls[0],
                connections,
                duration,
                method: "GET"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                result.latency.p95 =
                    latencyHistogram.getValueAtPercentile(95);
                resolve(result);
            }
        );

        tracker.on("response", (_client, _statusCode, _bytes, responseTime) => {
            latencyHistogram.recordValue(responseTime);
        });
    });

const main = async () => {
    if (!Number.isInteger(duration) || duration < 1) {
        throw new Error("CACHE_TEST_DURATION must be a positive integer");
    }
    if (!Number.isInteger(connections) || connections < 1) {
        throw new Error("CACHE_TEST_CONNECTIONS must be a positive integer");
    }
    if (!Number.isInteger(coldBurstSize) || coldBurstSize < 2) {
        throw new Error("CACHE_TEST_COLD_BURST must be an integer of at least 2");
    }
    if (!Number.isInteger(warmRequestsPerUrl) || warmRequestsPerUrl < 1) {
        throw new Error("CACHE_TEST_WARM_REQUESTS must be a positive integer");
    }

    const healthResponse = await fetch(new URL("/api/v1/health", baseUrl));
    if (!healthResponse.ok) {
        throw new Error(`Backend health check returned HTTP ${healthResponse.status}`);
    }

    await redisClient.connect();
    try {
        if (await redisClient.ping() !== "PONG") {
            throw new Error("Redis did not return PONG");
        }

        const initialStats = await getCacheStats();
        if (initialStats.hits !== 0 || initialStats.misses !== 0) {
            throw new Error(
                `Expected fresh backend cache counters at zero; got ${initialStats.hits} hits and ${initialStats.misses} misses. Restart the backend before running.`
            );
        }

        const clearedKeys = await clearListingCache();
        console.log("\n===== REDIS PRODUCT CACHE HIT-RATE TEST =====");
        console.log(`Backend: ${baseUrl}`);
        console.log("Redis: connected and responding to PING");
        console.log("Cache counters: fresh process, hits=0, misses=0");
        console.log(`Cleared product-list cache keys: ${clearedKeys}`);
        console.log(`Catalog size verified: at least 100,000 products`);

        const coldUrl = listingUrls[0];
        const coldStartStats = await getCacheStats();
        const coldStartedAt = performance.now();
        const coldResults = await Promise.all(
            Array.from({ length: coldBurstSize }, () => fetchListing(coldUrl))
        );
        const coldElapsedMs = Number(
            (performance.now() - coldStartedAt).toFixed(2)
        );
        const coldStats = await getCacheStats();
        const coldHits = coldStats.hits - coldStartStats.hits;
        const coldMisses = coldStats.misses - coldStartStats.misses;

        console.log("\nCold-cache simultaneous same-key burst:");
        console.log(`  URL: ${coldUrl}`);
        console.log(`  Concurrent requests: ${coldBurstSize}`);
        console.log(`  HTTP 200 responses: ${coldResults.length}`);
        console.log(`  Burst elapsed: ${coldElapsedMs} ms`);
        console.log(
            `  Unfiltered catalog count: ${coldResults[0]?.totalProducts ?? 0}`
        );
        if (coldResults.some((result) => result.totalProducts < 100_000)) {
            throw new Error("The unfiltered listing did not verify a 100K catalog");
        }
        console.log(`  Cache hits: ${coldHits}`);
        console.log(`  Cache misses: ${coldMisses}`);
        console.log(
            `  Cold-cache stampede observed: ${coldMisses > 1 ? "YES" : "NO"}`
        );

        console.log("\nWarming distinct product-list cache keys:");
        for (const url of listingUrls) {
            const result = await fetchListing(url);
            console.log(`  HTTP ${result.status}: ${url}`);
        }

        const warmResults = await Promise.all(
            listingUrls.flatMap((url) =>
                Array.from(
                    { length: warmRequestsPerUrl },
                    () => fetchListing(url)
                )
            )
        );
        const warmStats = await getCacheStats();
        console.log("\nRepeated requests across warmed listing variants:");
        console.log(`  Distinct listing URLs: ${listingUrls.length}`);
        console.log(
            `  Requests: ${warmResults.length} (${warmRequestsPerUrl} per URL)`
        );
        console.log(
            `  All responses successful: ${warmResults.length === listingUrls.length * warmRequestsPerUrl}`
        );
        console.log(
            `  Cumulative hits/misses: ${warmStats.hits}/${warmStats.misses}`
        );

        const beforeLoad = await getCacheStats();
        console.log(
            `\nRunning warm-cache load: ${connections} connections for ${duration}s on ${coldUrl}`
        );
        const load = await runLoad();
        const afterLoad = await getCacheStats();
        const loadHits = afterLoad.hits - beforeLoad.hits;
        const loadMisses = afterLoad.misses - beforeLoad.misses;
        const countedCacheLookups = loadHits + loadMisses;
        const totalHits = afterLoad.hits;
        const totalMisses = afterLoad.misses;
        const totalLookups = totalHits + totalMisses;

        console.log("\nWarm-cache load results:");
        console.log(`  Total requests: ${load.requests.total}`);
        console.log(`  Requests/sec: ${load.requests.average}`);
        console.log(`  Average latency: ${load.latency.average} ms`);
        console.log(`  P50 latency: ${load.latency.p50} ms`);
        console.log(`  P95 latency: ${load.latency.p95} ms`);
        console.log(`  P99 latency: ${load.latency.p99} ms`);
        console.log(`  Max latency: ${load.latency.max} ms`);
        console.log(`  Errors: ${load.errors}`);
        console.log(`  Non-2xx responses: ${load.non2xx}`);
        console.log(`  Cache hits during load: ${loadHits}`);
        console.log(`  Cache misses during load: ${loadMisses}`);
        console.log(
            `  Hit rate during load: ${countedCacheLookups === 0 ? 0 : Number(((loadHits / countedCacheLookups) * 100).toFixed(2))}%`
        );

        console.log("\nAll test cache counters:");
        console.log(`  Hits: ${totalHits}`);
        console.log(`  Misses: ${totalMisses}`);
        console.log(`  Total: ${totalLookups}`);
        console.log(
            `  Hit rate: ${totalLookups === 0 ? 0 : Number(((totalHits / totalLookups) * 100).toFixed(2))}%`
        );
        console.log(
            `  Miss rate: ${totalLookups === 0 ? 0 : Number(((totalMisses / totalLookups) * 100).toFixed(2))}%`
        );
        console.log(
            `  Cache-hit verification: ${
                load.errors === 0 &&
                load.non2xx === 0 &&
                loadHits > 0 &&
                loadMisses === 0
                    ? "PASS"
                    : "FAIL"
            }`
        );
    } finally {
        await redisClient.quit();
    }
};

main().catch((error) => {
    console.error(`Redis cache hit-rate test failed: ${error.message}`);
    process.exitCode = 1;
});
