function notFoundHandler(req, res, next) {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'API route not found',
            path: req.originalUrl
        });
    }
    return next();
}

function errorHandler(err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    console.error(err.stack || err.message || err);
    res.status(status).json({
        success: false,
        error: status >= 500 ? 'Internal server error' : err.message,
        details: isProduction ? undefined : err.message
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
