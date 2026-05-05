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
// REPLACE the challenges array at the top with this:
const challenges = [
  {
    challenge_order: 1,
    title: "Fake Bank Login Page",
    description: "This website claims to be from your bank. Find 3 red flags.",
    fake_url: "http://m1crosoft-bank-secure.com/login",
    real_url: "https://microsoft.com",
    screenshot_url: "/images/phish_1.png",
    difficulty: "easy",
    red_flags: {
      create: [
        {
          // URL bar: 'm1crosoft-bank-secure.com' — spans from left edge of browser chrome
          label: "Typo domain",
          explanation: "The domain uses 'm1crosoft' with a '1' instead of 'i'. This is a common phishing trick.",
          element_type: "url",
          x_percent: 23.0,
          y_percent: 9.0,
          width_percent: 45.0,
          height_percent: 10.0,
        },
        {
          // ACTION REQUIRED red banner across full browser content width
          label: "Urgent warning banner",
          explanation: "The message pressures users to act quickly, which is a common phishing tactic.",
          element_type: "content",
          x_percent: 23.0,
          y_percent: 34.0,
          width_percent: 65.0,
          height_percent: 10.0,
        },
        {
          // 'Microsoft Bank' logo — brand clearly does not match a bank
          label: "Fake brand mismatch",
          explanation: "Microsoft is not a bank. This mismatch is a clear red flag.",
          element_type: "logo",
          x_percent: 22.0,
          y_percent: 20.0,
          width_percent: 20.0,
          height_percent: 12.0,
        },
      ],
    },
  },
  {
    challenge_order: 2,
    title: "Email Verification Scam",
    description: "Verify your email account to continue using services. Find 3 red flags.",
    fake_url: "https://secure-mail-verification.com/verify",
    real_url: "https://gmail.com",
    screenshot_url: "/images/phish_2.png",
    difficulty: "medium",
    red_flags: {
      create: [
        {
          // URL bar: 'secure-maill-verif1cation.com'
          label: "Suspicious domain",
          explanation: "The domain 'secure-maill-verif1cation.com' is not a real email provider. Legitimate providers use gmail.com, outlook.com, etc.",
          element_type: "url",
          x_percent: 21.0,
          y_percent: 17.0,
          width_percent: 45.0,
          height_percent: 10.0,
        },
        {
          // 'Your account will be locked in 24 hours' box on the left
          label: "Urgency message",
          explanation: "Threatening account lock in 24 hours is a scare tactic to rush users into entering their credentials.",
          element_type: "content",
          x_percent: 23.0,
          y_percent: 51.0,
          width_percent: 15.0,
          height_percent: 35.0,
        },
        {
          // Password field inside the verification form
          label: "Asking for password",
          explanation: "Legitimate services never ask you to re-enter your password on a third-party verification page.",
          element_type: "form",
          x_percent: 41.0,
          y_percent: 63.0,
          width_percent: 25.0,
          height_percent: 9.0,
        },
      ],
    },
  },
  {
    challenge_order: 3,
    title: "Fake Checkout Page",
    description: "Complete your purchase before the offer expires! Find 3 red flags.",
    fake_url: "https://amazon-deals-secure-pay.net/checkout",
    real_url: "https://amazon.com",
    screenshot_url: "/images/phish_3.png",
    difficulty: "hard",
    red_flags: {
      create: [
        {
          // URL bar: 'amaz0n-deals-secure-pay.net'
          label: "Fake Amazon domain",
          explanation: "The domain 'amaz0n-deals-secure-pay.net' is not amazon.com. Attackers use lookalike domains to steal payment info.",
          element_type: "url",
          x_percent: 21.0,
          y_percent: 12.0,
          width_percent: 50.0,
          height_percent: 10.0,
        },
        {
          // 'Limited offer! Expires in 05:00' top-right countdown timer
          label: "Fake urgency timer",
          explanation: "Countdown timers are a pressure tactic to stop you thinking critically before you enter payment details.",
          element_type: "content",
          x_percent: 80.0,
          y_percent: 21.0,
          width_percent: 19.0,
          height_percent: 8.0,
        },
        {
          // Payment Information section: Card Number, MM/YY, CVV fields
          label: "Sensitive payment request",
          explanation: "The page asks for full credit card details on an untrusted site — a major phishing red flag.",
          element_type: "form",
          x_percent: 59.0,
          y_percent: 37.0,
          width_percent: 21.0,
          height_percent: 55.0,
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
      update: { screenshot_url: challenge.screenshot_url},
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
