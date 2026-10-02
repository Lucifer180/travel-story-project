const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticateToken } = require("../middlewares/auth.middleware");
const storyController = require("../controllers/story.controller");

const router = express.Router();

// Public - anyone with the link can read a shared story
router.get("/shared/:shareId", asyncHandler(storyController.getSharedStory));

// Everything below requires a valid token
router.post("/add-travel-story", authenticateToken, asyncHandler(storyController.addStory));
router.get("/get-all-stories", authenticateToken, asyncHandler(storyController.getAllStories));
router.put("/edit-story/:id", authenticateToken, asyncHandler(storyController.editStory));
router.delete("/delete-story/:id", authenticateToken, asyncHandler(storyController.deleteStory));
router.put("/update-is-favourite/:id", authenticateToken, asyncHandler(storyController.updateIsFavourite));

router.get("/search", authenticateToken, asyncHandler(storyController.searchStories));
router.get("/travel-stories/filter", authenticateToken, asyncHandler(storyController.filterStoriesByDate));

router.post("/stories/:id/share", authenticateToken, asyncHandler(storyController.shareStory));
router.delete("/stories/:id/share", authenticateToken, asyncHandler(storyController.unshareStory));

module.exports = router;
