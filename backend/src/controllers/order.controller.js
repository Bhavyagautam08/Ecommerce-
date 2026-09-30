import * as orderService from "../services/order.service.js";

export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const { shippingAddress } = req.body;
        const order = await orderService.createOrder(userId, shippingAddress);
        res.status(201).json(order);
    } catch (error) {
        if (error.message.includes("not found") || error.message.includes("empty") || error.message.includes("active") || error.message.includes("stock")) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const orders = await orderService.getUserOrders(userId);
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const { orderId } = req.params;
        const order = await orderService.getOrderById(userId, orderId);
        res.status(200).json(order);
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(orderId, status);
        res.status(200).json(order);
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const { orderId } = req.params;
        const order = await orderService.cancelOrder(userId, orderId);
        res.status(200).json(order);
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("Cannot cancel")) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};
