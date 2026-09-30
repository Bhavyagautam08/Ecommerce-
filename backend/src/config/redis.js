import { REDIS_URL } from "./env.js";

// Mocking Redis with an in-memory Map to allow the app to run without a local Redis server
const store = new Map();

const redisClient = {
    get: async (key) => store.get(key) || null,
    set: async (key, value, options) => { 
        store.set(key, value); 
        return 'OK'; 
    },
    del: async (key) => { 
        if (Array.isArray(key)) {
            key.forEach(k => store.delete(k));
        } else {
            store.delete(key);
        }
    },
    keys: async (pattern) => {
        const prefix = pattern.replace('*', '');
        return Array.from(store.keys()).filter(k => k.startsWith(prefix));
    },
    on: () => {}
};

export const connectRedis = async () => {
    console.log("Mock Redis (in-memory) connected successfully.");
};

export default redisClient;