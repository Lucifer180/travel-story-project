const express = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const storyRoutes = require("./story.routes");
const uploadRoutes = require("./upload.routes");
const aiRoutes = require("./ai.routes");

const router = express.Router();

// Routes are mounted at the root to keep the existing public URLs unchanged
router.use(authRoutes);
router.use(userRoutes);
router.use(storyRoutes);
router.use(uploadRoutes);
router.use(aiRoutes);

module.exports = router;
