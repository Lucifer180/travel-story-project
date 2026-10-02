const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticateToken } = require("../middlewares/auth.middleware");
const aiController = require("../controllers/ai.controller");

const router = express.Router();

router.get("/ai/travel-suggestions", authenticateToken, asyncHandler(aiController.getTravelSuggestions));
router.post("/ai/polish-story", authenticateToken, asyncHandler(aiController.polishStory));

module.exports = router;
