const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/create-account", asyncHandler(authController.createAccount));
router.post("/login", asyncHandler(authController.login));

module.exports = router;
