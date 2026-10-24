// Stories store absolute image URLs (imageUrl, memorableImage, gallery), so
// moving the API to another host/port leaves them pointing at the old one.
// This rewrites the URL prefix for every story.
//   node scripts/rewrite-image-host.js http://localhost:8000 http://localhost:8001
//   add --dry-run to only report what would change
const mongoose = require("mongoose");
const config = require("../src/config");
const TravelStory = require("../src/models/travelStory.model");

const [from, to] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const dryRun = process.argv.includes("--dry-run");

if (!from || !to) {
    console.error("Usage: node scripts/rewrite-image-host.js <old-base-url> <new-base-url> [--dry-run]");
    process.exit(1);
}

const swap = (url) => (typeof url === "string" && url.startsWith(from + "/") ? to + url.slice(from.length) : url);

async function run() {
    await mongoose.connect(config.mongoUri);
    const stories = await TravelStory.find({});
    let changed = 0;
    for (const story of stories) {
        const next = {
            imageUrl: swap(story.imageUrl),
            memorableImage: swap(story.memorableImage),
            gallery: (story.gallery || []).map(swap),
        };
        const differs =
            next.imageUrl !== story.imageUrl ||
            next.memorableImage !== story.memorableImage ||
            next.gallery.some((url, i) => url !== story.gallery[i]);
        if (!differs) continue;
        changed++;
        if (!dryRun) await TravelStory.updateOne({ _id: story._id }, { $set: next });
    }
    console.log(`${dryRun ? "Would update" : "Updated"} ${changed} of ${stories.length} stories (${from} -> ${to}).`);
}

run()
    .catch((err) => {
        console.error("Rewrite failed:", err.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
