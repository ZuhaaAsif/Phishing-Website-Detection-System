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
    title: "The Microsoft Login Trap",
    description:
      'A user receives an urgent email saying their account will be suspended. They click a link and land on this page. Can you find 3 red flags?',
    fake_url: "https://m1crosoft.com/account/login?verify=true",
    real_url: "https://microsoft.com",
    screenshot_url: "/assets/challenges/challenge-1.png",
    difficulty: "easy",
    red_flags: {
      create: [
        {
          label: "Typo-squatted URL",
          explanation:
            "The domain is 'm1crosoft.com' — the letter 'i' has been replaced with the number '1'. This is called typo-squatting: attackers register domains that look nearly identical to legitimate ones to deceive users.",
          element_type: "url",
          x_percent: 5,
          y_percent: 2,
          width_percent: 60,
          height_percent: 5,
        },
        {
          label: "No HTTPS padlock",
          explanation:
            "The browser shows a warning icon instead of a padlock. Legitimate login pages always use HTTPS to encrypt your data. A missing or broken padlock means your credentials could be intercepted.",
          element_type: "padlock",
          x_percent: 1,
          y_percent: 2,
          width_percent: 4,
          height_percent: 5,
        },
        {
          label: "Urgency manipulation",
          explanation:
            "The message 'Your account will be SUSPENDED in 24 hours!' creates artificial urgency. Phishing attacks rely on panic to make you act without thinking. Legitimate companies send account notices through your account dashboard, not urgent pop-ups.",
          element_type: "content",
          x_percent: 10,
          y_percent: 30,
          width_percent: 80,
          height_percent: 12,
        },
      ],
    },
  },
  {
    challenge_order: 2,
    title: "The PayPal Payment Scam",
    description:
      'You receive an SMS saying a suspicious payment was made from your account. You tap the link. Something is very wrong here — spot 3 red flags.',
    fake_url: "http://paypa1-secure.helpdesk-login.com/verify",
    real_url: "https://paypal.com",
    screenshot_url: "/assets/challenges/challenge-2.png",
    difficulty: "medium",
    red_flags: {
      create: [
        {
          label: "Suspicious subdomain",
          explanation:
            "The real domain here is 'helpdesk-login.com', not 'paypal.com'. Scammers use 'paypa1-secure' as a subdomain to make the URL look legitimate at a glance. Always read URLs right-to-left from the first single slash.",
          element_type: "url",
          x_percent: 5,
          y_percent: 2,
          width_percent: 70,
          height_percent: 5,
        },
        {
          label: "HTTP instead of HTTPS",
          explanation:
            "The URL starts with 'http://' not 'https://'. Any page asking for financial credentials must use HTTPS. Sending data over plain HTTP exposes it to anyone monitoring the network.",
          element_type: "padlock",
          x_percent: 1,
          y_percent: 2,
          width_percent: 4,
          height_percent: 5,
        },
        {
          label: "Generic sender name",
          explanation:
            "The email/SMS is from 'PayPal Support Team <noreply@mail-support99.net>'. Legitimate PayPal messages come from '@paypal.com' addresses only. Any mismatch between the display name and actual address is a strong phishing indicator.",
          element_type: "sender",
          x_percent: 5,
          y_percent: 18,
          width_percent: 90,
          height_percent: 7,
        },
      ],
    },
  },
  {
    challenge_order: 3,
    title: "The Amazon Prize Lure",
    description:
      "Congratulations! You've been selected as this month's lucky winner. Or have you? Find 3 red flags before claiming your 'prize'.",
    fake_url: "https://amazon-winners-claim.tk/prize/ref=abc123",
    real_url: "https://amazon.com",
    screenshot_url: "/assets/challenges/challenge-3.png",
    difficulty: "hard",
    red_flags: {
      create: [
        {
          label: "Free TLD (.tk domain)",
          explanation:
            "The domain ends in '.tk', a free top-level domain frequently used by phishers because it requires no identity verification. Legitimate brands like Amazon use '.com', '.co.uk', etc., never free throwaway TLDs.",
          element_type: "url",
          x_percent: 5,
          y_percent: 2,
          width_percent: 80,
          height_percent: 5,
        },
        {
          label: "Too-good-to-be-true offer",
          explanation:
            "Unsolicited prize notifications are a classic social engineering tactic. Amazon does not randomly select users for cash prizes via email links. When an offer seems impossibly generous, it almost certainly is.",
          element_type: "content",
          x_percent: 10,
          y_percent: 25,
          width_percent: 80,
          height_percent: 15,
        },
        {
          label: "Credit card pre-required",
          explanation:
            "Asking for credit card details to 'cover shipping on your free prize' is a well-known scam pattern. Legitimate prize claims never require payment upfront. This is how attackers steal financial information.",
          element_type: "cta",
          x_percent: 20,
          y_percent: 65,
          width_percent: 60,
          height_percent: 10,
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
