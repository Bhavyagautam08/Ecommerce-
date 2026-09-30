const notFoundMiddleware = (req, res, next) => {
    res.status(404).json({
        "Message" : "Route not found" 
    })
}

export default notFoundMiddleware;