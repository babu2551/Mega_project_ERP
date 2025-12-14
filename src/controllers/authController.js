import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await User.findOne({ username, role });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login success",
            role: user.role,
            token,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
