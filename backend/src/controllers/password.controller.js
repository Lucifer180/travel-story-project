const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user.model");
const config = require("../config");
const { sendPasswordResetEmail } = require("../services/mail.service");

const MIN_PASSWORD_LENGTH = 6; // same rule as /change-password
const RESEND_COOLDOWN_MS = 60 * 1000;

// Same answer whether or not the email has an account, so this endpoint
// can't be used to find out who is registered.
const GENERIC_MESSAGE = "If an account exists for that email, a reset link has been sent.";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// POST /forgot-password { email }
async function forgotPassword(req, res) {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    const recentlySent =
        user?.resetPasswordRequestedAt && Date.now() - user.resetPasswordRequestedAt.getTime() < RESEND_COOLDOWN_MS;

    if (user && !recentlySent) {
        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordTokenHash = hashToken(token);
        user.resetPasswordExpires = new Date(Date.now() + config.passwordResetTtlMinutes * 60 * 1000);
        user.resetPasswordRequestedAt = new Date();
        await user.save();

        const resetUrl = `${config.frontendUrl.replace(/\/$/, "")}/reset-password/${token}`;
        try {
            await sendPasswordResetEmail({
                to: user.email,
                name: user.fullName,
                resetUrl,
                ttlMinutes: config.passwordResetTtlMinutes,
            });
        } catch (err) {
            // Logged, not returned: a different response here would reveal the account exists.
            console.error("Failed to send password reset email:", err.message);
        }
    }

    res.status(200).json({ error: false, message: GENERIC_MESSAGE });
}

// POST /reset-password { token, password }
async function resetPassword(req, res) {
    const { token, password } = req.body;
    if (typeof token !== "string" || !token) {
        return res.status(400).json({ error: true, message: "Reset link is invalid" });
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
        return res
            .status(400)
            .json({ error: true, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const user = await User.findOne({
        resetPasswordTokenHash: hashToken(token),
        resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
        return res
            .status(400)
            .json({ error: true, message: "This reset link is invalid or has expired. Please request a new one." });
    }

    user.password = await bcrypt.hash(password, 10);
    // one-time link: clear it so it can't be reused
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    user.resetPasswordRequestedAt = null;
    await user.save();

    res.status(200).json({ error: false, message: "Your password has been reset. You can now log in." });
}

module.exports = { forgotPassword, resetPassword };
