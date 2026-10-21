// Seeds a test account with sample travel stories.
//   npm run seed
// Re-running is safe: only the sample stories below are replaced; the user's own
// stories and other users are untouched.
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const config = require("../src/config");
const User = require("../src/models/user.model");
const TravelStory = require("../src/models/travelStory.model");

const TEST_USER = {
    fullName: "Shreyas S",
    email: "shreyas.s.20118@gmail.com",
    password: "12345678",
};

// Stories use the placeholder image so deleting one never removes a real upload.
const placeholderImgUrl = `${config.baseUrl}/assets/placeholder.png`;

// Stand-in for a shared photo folder; it opens Google Drive's home page.
const SAMPLE_DRIVE_LINK = "https://drive.google.com/drive/my-drive";

const STORIES = [
    {
        title: "Sunrise over Kyoto's Temples",
        story: "We woke before dawn to walk the empty lanes of Higashiyama. The pagoda at Yasaka glowed orange as the first light hit it, and by the time the tour buses arrived we were sipping matcha at a tiny tea house that had been in the same family for six generations.",
        visitedLocation: ["Kyoto", "Japan"],
        visitedDate: "2024-04-06",
        isFavourite: true,
        driveLink: SAMPLE_DRIVE_LINK,
    },
    {
        title: "Lost in the Medina of Marrakech",
        story: "Every turn in the souks opened onto something new: lantern makers, spice pyramids, a courtyard with a fountain nobody seemed to know about. We got gloriously lost twice and ended the night on a rooftop watching smoke rise from Jemaa el-Fnaa.",
        visitedLocation: ["Marrakech", "Morocco"],
        visitedDate: "2024-02-18",
    },
    {
        title: "Backwaters of Alleppey",
        story: "Two slow days on a kettuvallam houseboat, drifting past paddy fields and coconut groves. The cook made karimeen pollichathu fresh from the lake, and at night the only sounds were frogs and the soft slap of water on the hull.",
        visitedLocation: ["Alleppey", "Kerala", "India"],
        visitedDate: "2023-12-27",
        isFavourite: true,
        driveLink: SAMPLE_DRIVE_LINK,
    },
    {
        title: "Northern Lights in Tromsø",
        story: "Minus eighteen degrees, three hours of waiting, and then the sky simply exploded in green. Our guide said it was the strongest display of the season. Nobody spoke for a full ten minutes.",
        visitedLocation: ["Tromsø", "Norway"],
        visitedDate: "2023-11-14",
    },
    {
        title: "Gelato Trail through Florence",
        story: "The plan was culture: the Uffizi, the Duomo, Michelangelo's David. The reality was five gelaterias in one afternoon and a heated debate about whether pistachio or stracciatella deserves the crown.",
        visitedLocation: ["Florence", "Italy"],
        visitedDate: "2023-09-03",
    },
    {
        title: "Trekking to Everest Base Camp",
        story: "Twelve days of switchbacks, suspension bridges and yak traffic jams. Altitude made every step a negotiation, but standing among the prayer flags at 5,364 metres with Khumbu Icefall in front of us made every one of them worth it.",
        visitedLocation: ["Lukla", "Namche Bazaar", "Nepal"],
        visitedDate: "2023-05-21",
        isFavourite: true,
    },
    {
        title: "Island Hopping in Santorini",
        story: "White walls, blue domes and a sunset in Oia that the whole village seems to applaud. We rented a quad bike, found a black-sand beach with nobody on it, and ate tomato fritters until we couldn't move.",
        visitedLocation: ["Santorini", "Greece"],
        visitedDate: "2023-07-12",
    },
    {
        title: "Street Food Nights in Bangkok",
        story: "Yaowarat after dark is pure sensory overload: sizzling woks, neon signs and queues for the best pad thai in the city. Mango sticky rice at midnight became a non-negotiable ritual.",
        visitedLocation: ["Bangkok", "Thailand"],
        visitedDate: "2022-12-08",
    },
    {
        title: "Road Trip along the Great Ocean Road",
        story: "Two hundred and forty kilometres of cliffs, surf beaches and koalas napping in the gum trees. The Twelve Apostles at golden hour were even better than the postcards promised.",
        visitedLocation: ["Melbourne", "Victoria", "Australia"],
        visitedDate: "2022-10-15",
    },
    {
        title: "Desert Camp in Jaisalmer",
        story: "A camel ride into the Thar at sunset, dal baati by the campfire, and a sky so full of stars that the Milky Way cast a shadow. The folk musicians played until the fire burned down to embers.",
        visitedLocation: ["Jaisalmer", "Rajasthan", "India"],
        visitedDate: "2022-01-22",
    },
    {
        title: "Cherry Blossoms in Seoul",
        story: "Yeouido's riverside path was a tunnel of pink petals. We cycled along the Han, stopped for chimaek in the park, and ended the day with a lantern-lit walk through Bukchon Hanok Village.",
        visitedLocation: ["Seoul", "South Korea"],
        visitedDate: "2022-04-03",
    },
    {
        title: "Fjords and Waterfalls of Iceland",
        story: "Seljalandsfoss from behind, Skógafoss from the top, and a glacier lagoon full of icebergs that looked like sculptures. The weather changed every twenty minutes and we stopped caring.",
        visitedLocation: ["Reykjavík", "Vík", "Iceland"],
        visitedDate: "2021-08-19",
    },
];

async function seed() {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");

    const password = await bcrypt.hash(TEST_USER.password, 10);
    const user = await User.findOneAndUpdate(
        { email: TEST_USER.email },
        { $set: { fullName: TEST_USER.fullName, password } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const removed = await TravelStory.deleteMany({
        userId: user._id,
        title: { $in: STORIES.map((s) => s.title) },
    });
    const docs = STORIES.map((s) => ({
        ...s,
        userId: user._id,
        imageUrl: placeholderImgUrl,
        visitedDate: new Date(s.visitedDate),
    }));
    await TravelStory.insertMany(docs);

    console.log(`Test user: ${TEST_USER.email}`);
    console.log(`Replaced ${removed.deletedCount} previous sample stories with ${docs.length}.`);
}

seed()
    .catch((err) => {
        console.error("Seeding failed:", err.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
