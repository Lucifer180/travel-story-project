const TravelStory = require("../models/travelStory.model");
const aiService = require("../services/ai.service");

// GET /ai/travel-suggestions
async function getTravelSuggestions(req, res) {
    if (!aiService.isConfigured()) {
        return res.status(503).json({ error: true, message: aiService.NOT_CONFIGURED_MESSAGE });
    }

    const { userId } = req.user;
    const stories = await TravelStory.find({ userId }).sort({ visitedDate: -1 }).limit(30);

    if (stories.length === 0) {
        return res.status(400).json({
            error: true,
            message: "Add a few travel stories first so the AI has something to work with",
        });
    }

    // Send only the fields the model needs, and cap the story text
    const history = stories.map((s) => ({
        title: s.title,
        locations: s.visitedLocation,
        visitedDate: s.visitedDate,
        excerpt: s.story.slice(0, 300),
    }));

    try {
        const suggestions = await aiService.generateTravelSuggestions(history);
        if (suggestions === null) {
            return res.status(500).json({ error: true, message: "The AI declined this request. Please try again." });
        }
        res.status(200).json({ suggestions });
    } catch (err) {
        console.error("AI suggestion error:", err);
        res.status(500).json({
            error: true,
            message: aiService.describeAiError(err, "Failed to generate suggestions"),
        });
    }
}

// POST /ai/polish-story
async function polishStory(req, res) {
    if (!aiService.isConfigured()) {
        return res.status(503).json({ error: true, message: aiService.NOT_CONFIGURED_MESSAGE });
    }

    const { story, title } = req.body;
    if (!story || !story.trim()) {
        return res.status(400).json({ error: true, message: "Story text is required" });
    }

    try {
        const polished = await aiService.polishStory({ title, story });
        if (polished === null) {
            return res.status(500).json({ error: true, message: "The AI declined this request. Please try again." });
        }
        res.status(200).json({ polished });
    } catch (err) {
        console.error("AI polish error:", err);
        res.status(500).json({
            error: true,
            message: aiService.describeAiError(err, "Failed to polish story"),
        });
    }
}

module.exports = { getTravelSuggestions, polishStory };
