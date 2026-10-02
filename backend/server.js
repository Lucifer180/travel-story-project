const app = require("./src/app");
const config = require("./src/config");
const connectDB = require("./src/config/db");

// The HTTP server starts regardless of the database result, so a DB outage
// shows up as a clear per-request error (and on /health) instead of the
// server silently refusing to boot.
connectDB().catch((err) => {
    console.error("\n  The API is running but the database is NOT connected.");
    console.error("  Reason:", err.message);
    console.error("  Check MONGODB_URI in backend/.env, then restart.\n");
});

app.listen(config.port, () => {
    console.log(`Server listening on http://localhost:${config.port}`);
    console.log(`Health check:      http://localhost:${config.port}/health`);
});
