import { z } from "zod";

export const createOrderSchema = z.object({
    shippingAddress: z.object({
        fullName: z.string().min(1, "Full name is required"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        addressLine: z.string().min(1, "Address line is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().min(1, "Pincode is required")
    })
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
});
