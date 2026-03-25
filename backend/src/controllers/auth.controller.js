const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔐 Generate Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// ✅ REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 🔍 Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // 🔒 Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // 🎟️ Token
        const token = generateToken(newUser._id);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Register Error:', error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔍 Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 🎟️ Token
        const token = generateToken(user._id);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};