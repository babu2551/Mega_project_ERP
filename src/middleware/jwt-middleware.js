import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization || req.headers.Authorization || "";
    const token = header && header.startsWith("Bearer ") ? header.split(" ")[1] : header;

    if (!token) {
        return res.status(401).json({ error: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token is not valid" });
    }
};

export const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization || req.headers.Authorization || "";
    const token = header && header.startsWith("Bearer ") ? header.split(" ")[1] : header;
    if (!token) return next();
    try {
        req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
        // ignore invalid token for optional auth
    }
    return next();
};

export const requireRole = (roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const arr = Array.isArray(roles) ? roles : [roles];
    if (!arr.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    return next();
};
