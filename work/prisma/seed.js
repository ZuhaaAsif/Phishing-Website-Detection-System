/**
 * prisma/seed.js
 * Run with: npm run db:seed
 * Populates the database with sample data for development.
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * prisma/quiz-seed.js
 * Populates the three "Spot the Phish" challenges.
 *
 * Bounding-box coords are percentages of the screenshot image (0-100).
 * Adjust x_percent / y_percent / width_percent / height_percent to match
 * the actual positions in your challenge screenshots.
 */
const challenges = [
  {
  challenge_order: 1,
  title: "Fake Bank Login Page",
  description:
    "This website claims to be from your bank. Find 3 red flags.",
  fake_url: "https://m1crosoft-bank-secure.com/login",
  real_url: "https://microsoft.com",
  screenshot_url: "/public/images/phish_1.png",
  difficulty: "easy",
  red_flags: {
    create: [
      {
        label: "Typo domain",
        explanation:
          "The domain uses 'm1crosoft' with a '1' instead of 'i'. This is a common phishing trick.",
        element_type: "url",
        x_percent: 5.86,
        y_percent: 8.79,
        width_percent: 58.59,
        height_percent: 15.38,
      },
      {
        label: "Urgent warning banner",
        explanation:
          "The message pressures users to act quickly, which is a common phishing tactic.",
        element_type: "content",
        x_percent: 14.65,
        y_percent: 39.56,
        width_percent: 68.36,
        height_percent: 26.37,
      },
      {
        label: "Fake brand mismatch",
        explanation:
          "Microsoft is not a bank. This mismatch is a clear red flag.",
        element_type: "logo",
        x_percent: 12.20,
        y_percent: 26.37,
        width_percent: 24.41,
        height_percent: 21.98,
      },
    ],
  },
},
  {
  challenge_order: 2,
  title: "Email Verification Scam",
  description:
    "Verify your email account to continue using services. Find 3 red flags.",
  fake_url: "https://secure-mail-verification.com/verify",
  real_url: "https://gmail.com",
  screenshot_url: "/public/images/phish_2.png",
  difficulty: "medium",
  red_flags: {
    create: [
      {
        label: "Suspicious domain",
        explanation:
          "The domain is not an official email provider like Gmail or Outlook.",
        element_type: "url",
        x_percent: 5.86,
        y_percent: 12.09,
        width_percent: 63.48,
        height_percent: 15.38,
      },
      {
        label: "Urgency message",
        explanation:
          "Threatening account lock in 24 hours is a tactic to rush users.",
        element_type: "content",
        x_percent: 9.76,
        y_percent: 42.86,
        width_percent: 24.41,
        height_percent: 43.96,
      },
      {
        label: "Asking for password",
        explanation:
          "Legitimate services rarely ask you to re-enter your password on random verification pages.",
        element_type: "form",
        x_percent: 39.06,
        y_percent: 42.86,
        width_percent: 29.30,
        height_percent: 54.95,
      },
    ],
  },
},
  {
  challenge_order: 3,
  title: "Fake Checkout Page",
  description:
    "Complete your purchase before the offer expires! Find 3 red flags.",
  fake_url: "https://amazon-deals-secure-pay.net/checkout",
  real_url: "https://amazon.com",
  screenshot_url: "/public/images/phish_3.png",
  difficulty: "hard",
  red_flags: {
    create: [
      {
        label: "Fake Amazon domain",
        explanation:
          "The domain is not 'amazon.com'. Attackers use similar-looking domains.",
        element_type: "url",
        x_percent: 5.86,
        y_percent: 19.78,
        width_percent: 63.48,
        height_percent: 15.38,
      },
      {
        label: "Fake urgency timer",
        explanation:
          "Countdown timers create pressure to rush decisions.",
        element_type: "content",
        x_percent: 73.24,
        y_percent: 24.18,
        width_percent: 21.97,
        height_percent: 26.37,
      },
      {
        label: "Sensitive payment request",
        explanation:
          "The page asks for full credit card details on an untrusted site.",
        element_type: "form",
        x_percent: 43.95,
        y_percent: 41.76,
        width_percent: 39.06,
        height_percent: 65.93,
      },
    ],
  },
},
];

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

  console.log("Seeded challenges, users, websites, and reviews");
  console.log("🌱 Seeding quiz challenges…");
  for (const challenge of challenges) {
    await prisma.quiz_challenges.upsert({
      where: { challenge_order: challenge.challenge_order },
      update: {},
      create: challenge,
    });
    console.log(`  ✅ Challenge ${challenge.challenge_order}: "${challenge.title}"`);
  }
  console.log("🎉 Quiz seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
