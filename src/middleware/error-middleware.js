import { ApiError } from "../utils/api-error.js";

export const errorHandler = (err, req, res, next) => {
    // Log full stack in dev, or just message in prod
    console.error("Unhandled error:", err && (err.stack || err.message || err));

    // Multer file upload errors
    if (err && err.name === "MulterError") {
        return res.status(400).json({
            success: false,
            message: err.message || "File upload error",
        });
    }

    // Custom ApiError handling
    if (err instanceof ApiError) {
        return res.status(err.statusCode || 400).json({
            success: false,
            message: err.message || "Error",
            errors: err.errors || [],
        });
    }

    // Fallback for unknown errors
    const status = err && (err.status || err.statusCode) ? (err.status || err.statusCode) : 500;

    return res.status(status).json({
        success: false,
        message: err && err.message ? err.message : "Internal Server Error",
        ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    });
};
