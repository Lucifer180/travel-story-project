const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authController = require("../controllers/auth.controller");
const passwordController = require("../controllers/password.controller");

const router = express.Router();

router.post("/create-account", asyncHandler(authController.createAccount));
router.post("/login", asyncHandler(authController.login));
router.post("/forgot-password", asyncHandler(passwordController.forgotPassword));
router.post("/reset-password", asyncHandler(passwordController.resetPassword));

module.exports = router;
