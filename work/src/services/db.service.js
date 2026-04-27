/**
 * src/services/db.service.js — Prisma singleton
 * Import this wherever you need a database client.
 * Using a singleton avoids opening too many connections.
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;