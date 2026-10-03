import { randomUUID } from "node:crypto";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import {
    claimOrderIdempotencyKey,
    completeOrderIdempotencyKey,
    getOrderIdempotencyResult,
    releaseOrderIdempotencyKey
} from "./idempotency.service.js";

export const createOrder = async (userId, shippingAddress, idempotencyKey) => {
    const token = randomUUID();
    let claimed = false;
    let transactionCommitted = false;
    let session;

    try {
        for (let attempt = 0; attempt < 2; attempt++) {
            claimed = await claimOrderIdempotencyKey(userId, idempotencyKey, token);

            if (claimed) {
                break;
            }

            const existingResult = await getOrderIdempotencyResult(userId, idempotencyKey);

            if (!existingResult) {
                continue;
            }

            if (existingResult.startsWith("completed:")) {
                const orderId = existingResult.slice("completed:".length);
                const existingOrder = await Order.findOne({ _id: orderId, user: userId });

                if (!existingOrder) {
                    throw new Error("Idempotency result references a missing order");
                }

                return existingOrder;
            }

            if (existingResult.startsWith("processing:")) {
                const error = new Error("An order request with this key is still processing");
                error.statusCode = 409;
                throw error;
            }

            throw new Error("Invalid order idempotency state");
        }

        if (!claimed) {
            const error = new Error("An order request with this key is still processing");
            error.statusCode = 409;
            throw error;
        }

        session = await Order.startSession();

        let createdOrder;

        await session.withTransaction(async () => {
            const cart = await Cart.findOne({ user: userId }).session(session);

            if (!cart) {
                throw new Error("Cart not found");
            }

            if (cart.items.length === 0) {
                throw new Error("Cart is empty");
            }

            const orderItems = [];
            let totalAmount = 0;

            for (const item of cart.items) {
                const product = await Product.findById(item.product).session(session);

                if (!product) {
                    throw new Error(`Product with ID ${item.product} not found`);
                }

                if (!product.isActive) {
                    throw new Error(`Product ${product.name} is no longer active`);
                }

                const subtotal = product.price * item.quantity;
                totalAmount += subtotal;

                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        isActive: true,
                        stock: { $gte: item.quantity }
                    },
                    {
                        $inc: { stock: -item.quantity }
                    },
                    {
                        new: true,
                        session
                    }
                );

                if (!updatedProduct) {
                    throw new Error(
                        `Insufficient stock for product ${product.name}`
                    );
                }

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    subtotal
                });
            }

            const order = new Order({
                user: userId,
                items: orderItems,
                totalAmount,
                shippingAddress
            });

            await order.save({ session });

            cart.items = [];
            await cart.save({ session });

            createdOrder = order;
        });

        transactionCommitted = true;

        const storedResult = await completeOrderIdempotencyKey(
            userId,
            idempotencyKey,
            token,
            createdOrder._id
        );

        if (!storedResult) {
            throw new Error("Could not persist the completed order idempotency result");
        }

        return createdOrder;
    } catch (error) {
        if (claimed && !transactionCommitted) {
            try {
                await releaseOrderIdempotencyKey(userId, idempotencyKey, token);
            } catch (releaseError) {
                console.error("Failed to release order idempotency key:", releaseError);
            }
        }

        throw error;
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

export const getUserOrders = async (userId) => {
    return await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("items.product", "images category brand");
};

export const getOrderById = async (userId, orderId) => {
    const order = await Order.findOne({ _id: orderId, user: userId })
        .populate("items.product", "images category brand");

    if (!order) {
        throw new Error("Order not found or you don't have access");
    }

    return order;
};

export const getAllOrders = async () => {
    return await Order.find()
        .sort({ createdAt: -1 })
        .populate("user", "name email");
};

export const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error("Order not found");
    }

    order.status = status;
    await order.save();
    return order;
};

export const cancelOrder = async (userId, orderId) => {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
        throw new Error("Order not found or you don't have access");
    }

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
        throw new Error(`Cannot cancel order. Current status: ${order.status}`);
    }

    order.status = "cancelled";
    await order.save();

    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
        });
    }

    return order;
};
