const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticateToken } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const uploadController = require("../controllers/upload.controller");

const router = express.Router();

router.post(
    "/image-upload",
    authenticateToken,
    upload.single("image"),
    asyncHandler(uploadController.uploadImage)
);
router.delete("/delete-image", authenticateToken, asyncHandler(uploadController.deleteImage));

module.exports = router;
