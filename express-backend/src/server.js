const app    = require("./app");
const prisma = require("./utils/prisma");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Verify DB connection before accepting traffic
    await prisma.$connect();
    console.log("✅ Database connected.");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`📦 API base:     http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully…`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
