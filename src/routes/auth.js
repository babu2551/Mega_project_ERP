import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const saltRounds = 10;

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in environment");
}

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const validRoles = ["faculty", "pc", "vac", "admin"];

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "username, password and role are required",
            });
        }

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
            });
        }

        const existingUser = await User.findOne({ username, role });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists for this role",
            });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            username,
            password: hashedPassword,
            role,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Register error:", err);
        
        // Handle Mongoose validation errors
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(", "),
            });
        }
        
        // Handle duplicate key errors
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this username and role",
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const validRoles = ["faculty", "pc", "vac", "admin"];

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "username, password and role are required",
            });
        }

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
            });
        }

        const user = await User.findOne({ username, role });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        let isMatch = false;

        if (user.password?.startsWith("$2")) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // legacy plaintext password → migrate
            if (user.password === password) {
                const newHash = await bcrypt.hash(password, saltRounds);
                user.password = newHash;
                await user.save();
                isMatch = true;
            }
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        
        // Handle Mongoose validation errors
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(", "),
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

export default router;
