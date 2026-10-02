const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("../config");

function signToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

// POST /create-account
async function createAccount(req, res) {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
        return res.status(400).json({ error: true, message: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();

    return res.status(201).json({
        error: false,
        user: { fullName: user.fullName, email: user.email },
        accessToken: signToken(user._id),
        message: "registration Successfull",
    });
}

// POST /login
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: true, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    // Same message for unknown email and wrong password so the endpoint
    // can't be used to discover which emails are registered
    if (!user) {
        return res.status(400).json({ error: true, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: true, message: "Invalid credentials" });
    }

    return res.status(200).json({
        error: false,
        message: "Login successful",
        user: { fullName: user.fullName, email: user.email },
        accessToken: signToken(user._id),
    });
}

module.exports = { createAccount, login };
