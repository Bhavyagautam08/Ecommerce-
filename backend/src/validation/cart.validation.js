import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const addItemSchema = z.object({
    productId: z.string().regex(objectIdPattern, "Invalid product ID format"),
    quantity: z.number().int().positive()
});

export const updateItemSchema = z.object({
    quantity: z.number().int().positive()
});

export const removeItemSchema = z.object({
    productId: z.string().regex(objectIdPattern, "Invalid product ID format")
});
