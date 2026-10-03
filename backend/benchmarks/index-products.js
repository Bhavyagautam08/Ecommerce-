import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const MINIMUM_PRODUCT_COUNT = 100_000;
const REPEATS = 3;
const PAGE_SIZE = 10;

const median = (values) => {
    const sorted = [...values].sort((left, right) => left - right);
    return sorted[Math.floor(sorted.length / 2)];
};

const runExplain = (hint) => {
    let query = mongoose.connection.db
        .collection("products")
        .find({})
        .sort({ createdAt: -1 })
        .limit(PAGE_SIZE);

    if (hint) {
        query = query.hint(hint);
    }

    return query.explain("executionStats");
};

const main = async () => {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI must be configured in the backend environment");
    }

    await mongoose.connect(MONGO_URI);

    try {
        const db = mongoose.connection.db;
        const products = db.collection("products");
        const [productCount, indexes, buildInfo] = await Promise.all([
            products.countDocuments(),
            products.indexes(),
            db.admin().command({ buildInfo: 1 })
        ]);
        const createdAtIndex = indexes.find(
            (index) => index.key?.createdAt === -1
        );

        if (productCount < MINIMUM_PRODUCT_COUNT) {
            throw new Error(
                `Expected at least ${MINIMUM_PRODUCT_COUNT} products; found ${productCount}`
            );
        }
        if (!createdAtIndex) {
            throw new Error(
                "No createdAt:-1 index exists. This read-only benchmark will not create or modify indexes."
            );
        }

        console.log("\n===== 100K PRODUCT INDEX BENCHMARK =====");
        console.log(`Database: ${db.databaseName}`);
        console.log(`Products: ${productCount}`);
        console.log(`MongoDB version: ${buildInfo.version}`);
        console.log(`Page size: ${PAGE_SIZE}`);
        console.log(`Repeats per plan: ${REPEATS}`);
        console.log(`Indexed plan uses existing index: ${createdAtIndex.name}`);
        console.log(
            "Unindexed control forces natural collection order; the index remains in place."
        );

        const results = {
            collectionScan: [],
            indexed: []
        };

        for (let run = 1; run <= REPEATS; run++) {
            const cases = run % 2 === 1
                ? [
                    ["collectionScan", { $natural: 1 }],
                    ["indexed", { createdAt: -1 }]
                ]
                : [
                    ["indexed", { createdAt: -1 }],
                    ["collectionScan", { $natural: 1 }]
                ];

            for (const [name, hint] of cases) {
                const explain = await runExplain(hint);
                const stats = explain.executionStats;
                results[name].push({
                    run,
                    executionTimeMillis: stats.executionTimeMillis,
                    totalDocsExamined: stats.totalDocsExamined,
                    totalKeysExamined: stats.totalKeysExamined,
                    nReturned: stats.nReturned,
                    winningPlan: explain.queryPlanner.winningPlan
                });
            }
        }

        for (const [name, label] of [
            ["collectionScan", "WITHOUT INDEX (forced COLLSCAN + SORT)"],
            ["indexed", "WITH createdAt:-1 INDEX"]
        ]) {
            const runs = results[name];
            console.log(`\n--- ${label} ---`);

            for (const result of runs) {
                console.log(`Run ${result.run}:`);
                console.log(`  executionTimeMillis: ${result.executionTimeMillis}`);
                console.log(`  totalDocsExamined: ${result.totalDocsExamined}`);
                console.log(`  totalKeysExamined: ${result.totalKeysExamined}`);
                console.log(`  nReturned: ${result.nReturned}`);
                console.log(
                    `  winningPlan: ${JSON.stringify(result.winningPlan)}`
                );
            }

            console.log("Median across runs:");
            console.log(
                `  executionTimeMillis: ${median(runs.map((run) => run.executionTimeMillis))}`
            );
            console.log(
                `  totalDocsExamined: ${median(runs.map((run) => run.totalDocsExamined))}`
            );
            console.log(
                `  totalKeysExamined: ${median(runs.map((run) => run.totalKeysExamined))}`
            );
            console.log(
                `  nReturned: ${median(runs.map((run) => run.nReturned))}`
            );
        }

        const scanMedian = median(
            results.collectionScan.map((run) => run.executionTimeMillis)
        );
        const indexMedian = median(
            results.indexed.map((run) => run.executionTimeMillis)
        );
        console.log("\n===== RESULT =====");
        console.log(
            `Median explain execution time: COLLSCAN ${scanMedian} ms; IXSCAN ${indexMedian} ms`
        );
        console.log(
            "These are MongoDB explain timings, not end-to-end HTTP latency; no indexes or data were modified."
        );
    } finally {
        await mongoose.disconnect();
    }
};

main().catch((error) => {
    console.error(`Index benchmark failed: ${error.message}`);
    process.exitCode = 1;
});
