import { ApiError } from "../utils/api-error.js";

export const errorHandler = (err, req, res, next) => {
    console.error("Unhandled error:", err && (err.stack || err.message || err));

    // multer file upload errors
    if (err && err.name === "MulterError") {
        return res.status(400).json({ success: false, message: err.message || "File upload error" });
    }

    if (err instanceof ApiError) {
        return res.status(err.statusCode || 400).json({
            success: false,
            message: err.message || "Error",
            errors: err.errors || [],
        });
    }

    const status = err && (err.status || err.statusCode) ? (err.status || err.statusCode) : 500;

    return res.status(status).json({
        success: false,
        message: err && err.message ? err.message : "Internal Server Error",
    });
};
