import redisClient from "../config/redis.js";

const ORDER_IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;
const COMPARE_AND_DELETE_SCRIPT = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
    end
    return 0
`;
const COMPARE_AND_SET_SCRIPT = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("SET", KEYS[1], ARGV[2], "EX", ARGV[3])
    end
    return nil
`;

const orderIdempotencyRedisKey = (userId, idempotencyKey) =>
    `idempotency:order:${userId}:${idempotencyKey}`;

export const claimOrderIdempotencyKey = async (userId, idempotencyKey, token) =>
    (await redisClient.set(
        orderIdempotencyRedisKey(userId, idempotencyKey),
        `processing:${token}`,
        { nx: true, ex: ORDER_IDEMPOTENCY_TTL_SECONDS }
    )) === "OK";

export const getOrderIdempotencyResult = async (userId, idempotencyKey) =>
    redisClient.get(orderIdempotencyRedisKey(userId, idempotencyKey));

export const completeOrderIdempotencyKey = async (
    userId,
    idempotencyKey,
    token,
    orderId
) =>
    redisClient.eval(
        COMPARE_AND_SET_SCRIPT,
        [orderIdempotencyRedisKey(userId, idempotencyKey)],
        [
            `processing:${token}`,
            `completed:${orderId}`,
            String(ORDER_IDEMPOTENCY_TTL_SECONDS)
        ]
    );

export const releaseOrderIdempotencyKey = async (
    userId,
    idempotencyKey,
    token
) =>
    redisClient.eval(
        COMPARE_AND_DELETE_SCRIPT,
        [orderIdempotencyRedisKey(userId, idempotencyKey)],
        [`processing:${token}`]
    );
