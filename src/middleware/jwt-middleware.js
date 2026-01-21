import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

//  extract token from multiple sources
const extractToken = (req) => {
    const header = req.headers.authorization || req.headers.Authorization || "";
    if (header.startsWith("Bearer ")) return header.split(" ")[1];
    if (req.cookies?.token) return req.cookies.token;
    if (req.headers["x-access-token"]) return req.headers["x-access-token"];
    if (req.query?.token) return req.query.token;
    if (req.body?.token) return req.body.token;
    return null;
};

// Middleware: authentication required
export const authMiddleware = (req, res, next) => {
    const token = extractToken(req);
    if (!token)
        return res.status(401).json({ error: "No token, authorization denied" });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token is invalid or expired" });
    }
};

// Middleware: optional authentication
export const optionalAuth = (req, res, next) => {
    const token = extractToken(req);
    if (!token) return next();
    try {
        req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        // ignore invalid token
    }
    return next();
};

// Middleware: role-based access
export const requireRole = (roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    return next();
};
