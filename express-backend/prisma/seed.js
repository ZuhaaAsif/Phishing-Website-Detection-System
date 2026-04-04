/**
 * prisma/seed.js
 * Run with: npm run db:seed
 * Populates the database with sample data for development.
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Upsert so re-runs are safe
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice",
      items: {
        create: [
          { title: "First Item", description: "Hello world", published: true },
          { title: "Draft Item", description: "Work in progress" },
        ],
      },
    },
  });

  console.log("Seeded:", alice);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
