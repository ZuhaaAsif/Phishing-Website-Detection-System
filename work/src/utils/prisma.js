const { PrismaClient } = require("@prisma/client");

// Reuse a single PrismaClient instance across the app.
// In development, prevents hot-reload from spawning too many connections.
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

module.exports = prisma;
