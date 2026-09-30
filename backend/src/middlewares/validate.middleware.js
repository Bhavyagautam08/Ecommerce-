const validate = (schema, source = "body") => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: result.error.issues
                });
            }

            if (source === "query") {
                Object.keys(result.data).forEach(key => {
                    req.query[key] = result.data[key];
                });
            } else {
                req[source] = result.data;
            }

            next();

        } catch (err) {
            next(err);
        }
    };
};

export default validate;