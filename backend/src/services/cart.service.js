import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const getCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate("items.product", "name price images stock");
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};

export const addItemToCart = async (userId, productId, quantity) => {
    const product = await Product.findById(productId);
    
    if (!product) {
        throw new Error("Product not found");
    }
    
    if (!product.isActive) {
        throw new Error("Product is not active");
    }
    
    if (quantity > product.stock) {
        throw new Error("Requested quantity exceeds available stock");
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // Product exists in cart, increase quantity
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (newQuantity > product.stock) {
            throw new Error("Total quantity exceeds available stock");
        }
        cart.items[itemIndex].quantity = newQuantity;
    } else {
        // New item
        cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return await cart.populate("items.product", "name price images stock");
};

export const updateCartItem = async (userId, productId, quantity) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
        throw new Error("Product not found in cart");
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        throw new Error("Product not available");
    }

    if (quantity > product.stock) {
        throw new Error("Requested quantity exceeds available stock");
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    return await cart.populate("items.product", "name price images stock");
};

export const removeCartItem = async (userId, productId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
        throw new Error("Product not found in cart");
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    return await cart.populate("items.product", "name price images stock");
};

export const clearCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    return cart;
};
