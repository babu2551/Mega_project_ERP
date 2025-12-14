import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const saltRounds = 10;

// Registration route - hash password before saving
router.post("/register", async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) return res.status(400).json({ error: 'username, password and role are required' });

        // prevent duplicate username+role
        const existing = await User.findOne({ username, role }).exec();
        if (existing) return res.status(409).json({ error: 'User already exists for the given role' });

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({ username, password: hashedPassword, role });
        await user.save();

        res.json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Login route - compare hashed password
router.post("/login", async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) return res.status(400).json({ error: 'username, password and role are required' });

        const user = await User.findOne({ username, role }).exec();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // If user.password doesn't look like a bcrypt hash (no $2a$ / $2b$) we may have an older plaintext record.
        // Support backward-compatible login: if plaintext equals provided password, hash it and save so future logins use bcrypt.
        const pw = user.password || '';
        let isMatch = false;
        if (pw.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, pw);
        } else if (pw === password) {
            // legacy store: plaintext match — migrate to hashed password
            try {
                const newHash = await bcrypt.hash(password, saltRounds);
                user.password = newHash;
                await user.save();
                isMatch = true;
            } catch (e) {
                console.error('Password migration failed', e);
            }
        }

        if (!isMatch) return res.status(401).json({ error: "Wrong password" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        res.json({
            message: "Login successful",
            token,
            role: user.role,
            user: user.username,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Middleware to protect routes
export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Token is not valid" });
    }
};

export default router;
