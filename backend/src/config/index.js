const path = require("path");

// Load .env from the backend root regardless of where the process was launched from
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const legacyConfig = require("../../config.json");

// Absolute paths to the on-disk folders served over HTTP
const BACKEND_ROOT = path.join(__dirname, "..", "..");

const config = {
    port: process.env.PORT || 8000,
    mongoUri: process.env.MONGODB_URI || legacyConfig.connectionString,
    jwtSecret: process.env.ACCESS_TOKEN_SECRET,
    jwtExpiresIn: "72h",

    paths: {
        root: BACKEND_ROOT,
        uploads: path.join(BACKEND_ROOT, "uploads"),
        assets: path.join(BACKEND_ROOT, "assets"),
    },

    // Public base URL used when building image URLs stored on stories
    get baseUrl() {
        return process.env.BASE_URL || `http://localhost:${this.port}`;
    },

    ai: {
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    },
};

module.exports = config;
