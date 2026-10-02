// Catch-all for unmatched routes
function notFound(req, res) {
    res.status(404).json({ error: true, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler. Any next(err) or rejected asyncHandler lands here,
// so failures are logged in one place instead of being swallowed per-route.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);

    // Multer rejects oversized or non-image uploads with its own error codes
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: true, message: "Image must be 5MB or smaller" });
    }
    if (err.message === "Only images are allowed") {
        return res.status(400).json({ error: true, message: err.message });
    }

    const status = err.status || 500;
    res.status(status).json({
        error: true,
        message: status === 500 ? "Internal server error" : err.message,
    });
}

module.exports = { notFound, errorHandler };
