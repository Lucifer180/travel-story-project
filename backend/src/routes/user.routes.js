const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticateToken } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.get("/get-user", authenticateToken, asyncHandler(userController.getUser));
router.put("/update-profile", authenticateToken, asyncHandler(userController.updateProfile));
router.put("/change-password", authenticateToken, asyncHandler(userController.changePassword));

module.exports = router;
