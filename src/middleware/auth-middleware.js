import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

const extractToken = (req) => {
    const header = req.headers.authorization || req.headers.Authorization || "";
    if (header && header.startsWith("Bearer ")) return header.split(" ")[1];
    if (req.cookies && req.cookies.token) return req.cookies.token;
    if (req.headers["x-access-token"]) return req.headers["x-access-token"];
    if (req.query && req.query.token) return req.query.token;
    if (req.body && req.body.token) return req.body.token;
    return null;
};

export const authMiddleware = (req, res, next) => {
    const token = extractToken(req);
    if (!token) return next(new ApiError(401, "No token, authorization denied"));

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        return next(new ApiError(401, "Token is not valid"));
    }
};

export const optionalAuth = (req, res, next) => {
    const token = extractToken(req);
    if (!token) return next();
    try {
        req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
        // ignore invalid token for optional auth
    }
    return next();
};

export const requireRole = (roles) => (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    const arr = Array.isArray(roles) ? roles : [roles];
    if (!arr.includes(req.user.role)) return next(new ApiError(403, "Forbidden"));
    return next();
};

export default authMiddleware;
