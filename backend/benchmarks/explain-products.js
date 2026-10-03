import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const pages = [1, 10, 100, 1_000, 5_000, 10_000];
const pageSize = 10;
const minimumProductCount = 100_000;

const main = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be configured in the backend environment");
    }

    await mongoose.connect(process.env.MONGO_URI);

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

        if (productCount < minimumProductCount) {
            throw new Error(
                `Expected at least ${minimumProductCount} products; found ${productCount}`
            );
        }
        if (!createdAtIndex) {
            throw new Error(
                "No createdAt:-1 index exists. This read-only benchmark will not create or modify indexes."
            );
        }

        console.log("\n===== DEEP OFFSET PAGINATION BENCHMARK =====");
        console.log(`Database: ${db.databaseName}`);
        console.log(`Products: ${productCount}`);
        console.log(`MongoDB version: ${buildInfo.version}`);
        console.log(`Sort index: ${createdAtIndex.name}`);
        console.log(`Page size: ${pageSize}`);

        for (const page of pages) {
            const skip = (page - 1) * pageSize;
            const explain = await products
                .find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .explain("executionStats");
            const stats = explain.executionStats;

            console.log(`\nPage ${page}`);
            console.log(`  Skip: ${skip}`);
            console.log(`  executionTimeMillis: ${stats.executionTimeMillis}`);
            console.log(`  totalDocsExamined: ${stats.totalDocsExamined}`);
            console.log(`  totalKeysExamined: ${stats.totalKeysExamined}`);
            console.log(`  nReturned: ${stats.nReturned}`);
        }

        console.log(
            "\nResults are MongoDB explain executionStats for offset pagination; no data or indexes were modified."
        );
    } finally {
        await mongoose.disconnect();
    }
};

main().catch((error) => {
    console.error(`Deep pagination benchmark failed: ${error.message}`);
    process.exitCode = 1;
});