const mongoose = require("mongoose");
const config = require("./index");

async function connectDB() {
    try {
        await mongoose.connect(config.mongoUri);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        throw err;
    }
}

module.exports = connectDB;
