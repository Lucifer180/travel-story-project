const bcrypt = require("bcrypt");
const User = require("../models/user.model");

// GET /get-user
async function getUser(req, res) {
    const { userId } = req.user;
    const isUser = await User.findOne({ _id: userId });
    if (!isUser) return res.sendStatus(401);

    return res.json({ user: isUser, message: "" });
}

// PUT /update-profile
async function updateProfile(req, res) {
    const { fullName } = req.body;
    const { userId } = req.user;

    if (!fullName || !fullName.trim()) {
        return res.status(400).json({ error: true, message: "Full name is required" });
    }

    const user = await User.findByIdAndUpdate(userId, { fullName: fullName.trim() }, { new: true });
    if (!user) return res.sendStatus(401);

    res.status(200).json({
        error: false,
        user: { fullName: user.fullName, email: user.email },
        message: "Profile updated successfully",
    });
}

// PUT /change-password
async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: true, message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: true, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) return res.sendStatus(401);

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: true, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ error: false, message: "Password changed successfully" });
}

module.exports = { getUser, updateProfile, changePassword };
