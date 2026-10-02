const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const config = require("./config");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// Static files (uploaded images and the placeholder)
app.use("/uploads", express.static(config.paths.uploads));
app.use("/assets", express.static(config.paths.assets));

// Health check for debugging "is the server up, and is the DB connected?"
app.get("/health", (req, res) => {
    const dbStateNames = ["disconnected", "connected", "connecting", "disconnecting"];
    const dbState = dbStateNames[mongoose.connection.readyState] || "unknown";

    res.json({
        status: "ok",
        port: config.port,
        database: dbState,
        aiConfigured: Boolean(config.ai.apiKey),
    });
});

// All API routes
app.use(routes);

// These must stay last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
