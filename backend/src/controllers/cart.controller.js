import * as cartService from "../services/cart.service.js";

export const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const cart = await cartService.getCart(userId);
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};

export const addItem = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const { productId, quantity } = req.body;
        const cart = await cartService.addItemToCart(userId, productId, quantity);
        res.status(200).json(cart);
    } catch (error) {
        if (error.message.includes("not found") || error.message.includes("active") || error.message.includes("stock")) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

export const updateItem = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const { productId } = req.params;
        const { quantity } = req.body;
        const cart = await cartService.updateCartItem(userId, productId, quantity);
        res.status(200).json(cart);
    } catch (error) {
        if (error.message.includes("not found") || error.message.includes("available") || error.message.includes("stock")) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

export const removeItem = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const { productId } = req.params;
        const cart = await cartService.removeCartItem(userId, productId);
        res.status(200).json(cart);
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

export const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const cart = await cartService.clearCart(userId);
        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};
