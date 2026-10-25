const path = require("path");

// Load .env from the backend root regardless of where the process was launched from
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const legacyConfig = require("../../config.json");

// Absolute paths to the on-disk folders served over HTTP
const BACKEND_ROOT = path.join(__dirname, "..", "..");

const config = {
    port: process.env.PORT || 8001,
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

    // Where links in emails point (the React app)
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

    // Outgoing mail (same variable names as the Ecommerce project)
    smtp: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM || process.env.SMTP_EMAIL,
    },

    passwordResetTtlMinutes: 30,

    ai: {
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    },
};

module.exports = config;
