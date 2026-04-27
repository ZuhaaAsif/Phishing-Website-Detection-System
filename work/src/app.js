/**
 * src/app.js — Express application factory
 * Registers middleware and mounts all route modules.
 */
const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const reviewRoutes = require("./routes/reviews.routes");
const websiteRoutes = require("./routes/websites.routes");
const analysisRoutes = require("./routes/analysis");
const userRoutes = require("./routes/user.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");
const frontendAnalysisRoutes = require("./routes/frontendAnalysis.routes");

const app = express();
app.use(express.urlencoded({ extended: true }));

// ── Security & utilities ──────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// ── API routes ────────────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", analysisRoutes);
app.use("/api/frontend", frontendAnalysisRoutes);

// Serve static files from public directory
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

// Handle SPA routing - serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Error handling ────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
