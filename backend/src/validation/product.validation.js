import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    images: z.array(z.string()),
    category: z.string().min(1),
    stock: z.number().int().nonnegative(),
    brand: z.string().min(1),
    isActive: z.boolean().optional()
});


export const updateProductSchema = createProductSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required for update"
        }
    );


export const productQuerySchema = z.object({
    page: z.coerce.number()
        .int()
        .positive()
        .optional(),

    limit: z.coerce.number()
        .int()
        .positive()
        .max(100)
        .optional(),

    search: z.string().optional(),

    category: z.string().optional(),

    sort: z.enum([
        "price_asc",
        "price_desc",
        "newest",
        "oldest"
    ]).optional()
});