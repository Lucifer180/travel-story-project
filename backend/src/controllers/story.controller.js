const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const TravelStory = require("../models/travelStory.model");
const config = require("../config");

const placeholderImgUrl = `${config.baseUrl}/assets/placeholder.png`;

// Deletes a story's image file from disk. Best effort: a missing file
// should never fail the request that triggered it.
function removeImageFile(imageUrl) {
    if (!imageUrl) return;
    const filePath = path.join(config.paths.uploads, path.basename(imageUrl));
    fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("Failed to delete image:", err.message);
        }
    });
}

// POST /add-travel-story
async function addStory(req, res) {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    if (!title || !story || !visitedLocation || !visitedDate || !imageUrl) {
        return res.status(400).json({ error: true, message: "all fields are required" });
    }

    const travelStory = new TravelStory({
        title,
        story,
        visitedLocation,
        userId,
        imageUrl,
        visitedDate: new Date(parseInt(visitedDate)),
    });
    await travelStory.save();

    res.status(201).json({ story: travelStory, message: "Added Successfully" });
}

// GET /get-all-stories
async function getAllStories(req, res) {
    const { userId } = req.user;
    const stories = await TravelStory.find({ userId }).sort({ isFavourite: -1 });
    res.status(200).json({ stories });
}

// PUT /edit-story/:id
async function editStory(req, res) {
    const { id } = req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;

    if (!title || !story || !visitedLocation || !visitedDate) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    const travelStory = await TravelStory.findOne({ _id: id, userId });
    if (!travelStory) {
        return res.status(404).json({ error: true, message: "travel story not found" });
    }

    travelStory.title = title;
    travelStory.story = story;
    travelStory.visitedLocation = visitedLocation;
    travelStory.imageUrl = imageUrl || placeholderImgUrl;
    travelStory.visitedDate = new Date(parseInt(visitedDate));
    await travelStory.save();

    res.status(200).json({ story: travelStory, message: "updateSuccessfull" });
}

// DELETE /delete-story/:id
async function deleteStory(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    const travelStory = await TravelStory.findOne({ _id: id, userId });
    if (!travelStory) {
        return res.status(404).json({ error: true, message: "Travel Story not found" });
    }

    await travelStory.deleteOne();
    removeImageFile(travelStory.imageUrl);

    res.status(200).json({ message: "Travel story deleted successfully" });
}

// PUT /update-is-favourite/:id
async function updateIsFavourite(req, res) {
    const { id } = req.params;
    const { userId } = req.user;
    const { isFavourite } = req.body;

    const travelStory = await TravelStory.findOne({ _id: id, userId });
    if (!travelStory) {
        return res.status(404).json({ error: true, message: "Travel story not found" });
    }

    travelStory.isFavourite = isFavourite;
    await travelStory.save();

    res.status(200).json({ story: travelStory, message: "update Successful" });
}

// GET /search?query=
async function searchStories(req, res) {
    const { query } = req.query;
    const { userId } = req.user;

    if (!query) {
        return res.status(400).json({ error: true, message: "query is required" });
    }

    const stories = await TravelStory.find({
        userId,
        $or: [
            { title: { $regex: query, $options: "i" } },
            { story: { $regex: query, $options: "i" } },
            { visitedLocation: { $regex: query, $options: "i" } },
        ],
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories });
}

// GET /travel-stories/filter?startDate=&endDate=
async function filterStoriesByDate(req, res) {
    const { startDate, endDate } = req.query;
    const { userId } = req.user;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: true, message: "Start date and end date are required." });
    }

    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: true, message: "Invalid date format." });
    }

    const stories = await TravelStory.find({
        userId,
        visitedDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories });
}

// POST /stories/:id/share - generate (or reuse) a public link
async function shareStory(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    const travelStory = await TravelStory.findOne({ _id: id, userId });
    if (!travelStory) {
        return res.status(404).json({ error: true, message: "Travel story not found" });
    }

    if (!travelStory.shareId) {
        travelStory.shareId = crypto.randomBytes(12).toString("hex");
        await travelStory.save();
    }

    res.status(200).json({
        error: false,
        shareId: travelStory.shareId,
        message: "Story is now shareable",
    });
}

// DELETE /stories/:id/share - revoke the public link
async function unshareStory(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    const travelStory = await TravelStory.findOne({ _id: id, userId });
    if (!travelStory) {
        return res.status(404).json({ error: true, message: "Travel story not found" });
    }

    travelStory.shareId = null;
    await travelStory.save();

    res.status(200).json({ error: false, message: "Sharing disabled" });
}

// GET /shared/:shareId - public read-only view, no auth
async function getSharedStory(req, res) {
    const { shareId } = req.params;

    const travelStory = await TravelStory.findOne({ shareId }).select("-userId");
    if (!travelStory) {
        return res.status(404).json({
            error: true,
            message: "This story is not shared or the link is invalid",
        });
    }

    res.status(200).json({ story: travelStory });
}

module.exports = {
    addStory,
    getAllStories,
    editStory,
    deleteStory,
    updateIsFavourite,
    searchStories,
    filterStoriesByDate,
    shareStory,
    unshareStory,
    getSharedStory,
};
