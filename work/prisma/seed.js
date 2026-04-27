/**
 * prisma/seed.js
 * Run with: npm run db:seed
 * Populates the database with sample data for development.
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const alice = await prisma.users.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      username: "alice",
      password: "$2a$10$hashedpasswordhere", // bcrypt hash for "password123"
      last_active: new Date(),
    },
  });

  const bob = await prisma.users.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      username: "bob",
      password: "$2a$10$hashedpasswordhere", // bcrypt hash for "password123"
      last_active: new Date(),
    },
  });

  // Create sample websites
  const google = await prisma.websites.upsert({
    where: { url: "https://www.google.com" },
    update: {},
    create: {
      website_name: "Google",
      url: "https://www.google.com",
      domain: "google.com",
      riskScore: 95,
      security_rate: 5,
      reputation: "safe",
      analysisDetails: { source: "seed" },
    },
  });

  const suspicious = await prisma.websites.upsert({
    where: { url: "http://suspicious-site.com" },
    update: {},
    create: {
      website_name: "Suspicious Site",
      url: "http://suspicious-site.com",
      domain: "suspicious-site.com",
      riskScore: 20,
      security_rate: 1,
      reputation: "malicious",
      analysisDetails: { source: "seed" },
    },
  });

  // Create sample reviews
  await prisma.reviews.createMany({
    data: [
      {
        review: "Great search engine!",
        website_id: google.website_id,
        user_id: alice.user_id,
        rate: 5,
      },
      {
        review: "This site looks suspicious, avoid it!",
        website_id: suspicious.website_id,
        user_id: bob.user_id,
        rate: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeded users, websites, and reviews");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
