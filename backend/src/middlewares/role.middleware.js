const roleChecker = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const { role } = req.user;

            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }

            next();

        } catch (err) {
            console.log("Error:", err.message);
            next(err);
        }
    };
};

export default roleChecker;