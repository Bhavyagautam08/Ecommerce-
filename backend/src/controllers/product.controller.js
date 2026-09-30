import {
    createProduct as createProductService,
    getAllProducts as getAllProductsService,
     getProductById as getProductByIdService
    }from "../services/product.service.js";

import {
    updateProductById as updateProductService,
    deleteProductById as deleteProductService
} from "../services/product.service.js";

export const createProduct = async (req, res, next) => {
    try {
        const product = await createProductService(req.body);

        return res.status(201).json({
            status: "ok",
            product
        });

    } catch (err) {
        console.log("Error:", err.message);
        next(err);
    }
};


export const getAllProducts = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";
        const sort = req.query.sort || "newest";
        const category = req.query.category || "";

        const result = await getAllProductsService(
            page,
            limit,
            search,
            sort,
            category
        );

        return res.status(200).json({
            status: "ok",
            ...result
        });

    } catch (err) {
        console.log("Error:", err.message);
        next(err);
    }
};


export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await getProductByIdService(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            status: "ok",
            product
        });

    } catch (err) {
        console.log("Error:", err.message);
        next(err);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await updateProductService(id, req.body);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            status: "ok",
            product
        });

    } catch (err) {
        console.log("Error:", err.message);
        next(err);
    }
};


export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await deleteProductService(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            status: "ok",
            message: "Product deleted successfully"
        });

    } catch (err) {
        console.log("Error:", err.message);
        next(err);
    }
};