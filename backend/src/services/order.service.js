import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const createOrder = async (userId, shippingAddress) => {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
        throw new Error("Cart not found");
    }
    
    if (cart.items.length === 0) {
        throw new Error("Cart is empty");
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
        const product = await Product.findById(item.product);
        
        if (!product) {
            throw new Error(`Product with ID ${item.product} not found`);
        }
        
        if (!product.isActive) {
            throw new Error(`Product ${product.name} is no longer active`);
        }
        
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

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

    await order.save();

    for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
        });
    }

    cart.items = [];
    await cart.save();

    return order;
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

    // Restore stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
        });
    }

    return order;
};
