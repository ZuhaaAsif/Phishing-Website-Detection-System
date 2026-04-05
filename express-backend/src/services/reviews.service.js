/**
 * src/services/reviews.service.js
 * Business logic layer for Reviews.
 * Schema: review_id, review, website_id, user_id, rate
 */
const prisma = require("./db.service");

/** Return all reviews with user and website info. */
const getAllReviews = async () =>
  prisma.reviews.findMany({
    include: {
      users: { select: { user_id: true, username: true, email: true } },
      websites: { select: { website_id: true, website_name: true, url: true } }
    },
    orderBy: { review_id: "desc" }
  });

/** Return a single review by ID, or null if not found. */
const getReviewById = async (id) =>
  prisma.reviews.findUnique({
    where: { review_id: id },
    include: {
      users: { select: { user_id: true, username: true, email: true } },
      websites: { select: { website_id: true, website_name: true, url: true } }
    }
  });

/** Create and return a new review. */
const createReview = async ({ review, website_id, user_id, rate }) => {
  // Validate rating is between 1-5
  if (rate < 1 || rate > 5) {
    const err = new Error("Rating must be between 1 and 5");
    err.statusCode = 400;
    throw err;
  }

  // Check if user exists
  const userExists = await prisma.users.findUnique({ where: { user_id } });
  if (!userExists) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  // Check if website exists
  const websiteExists = await prisma.websites.findUnique({ where: { website_id } });
  if (!websiteExists) {
    const err = new Error("Website not found");
    err.statusCode = 404;
    throw err;
  }

  return prisma.reviews.create({
    data: { review, website_id, user_id, rate },
    include: {
      users: { select: { user_id: true, username: true, email: true } },
      websites: { select: { website_id: true, website_name: true, url: true } }
    }
  });
};

/** Update an existing review; throws if not found. */
const updateReview = async (id, data) => {
  const exists = await prisma.reviews.findUnique({ where: { review_id: id } });
  if (!exists) {
    const err = new Error("Review not found");
    err.statusCode = 404;
    throw err;
  }

  // Validate rating if provided
  if (data.rate !== undefined && (data.rate < 1 || data.rate > 5)) {
    const err = new Error("Rating must be between 1 and 5");
    err.statusCode = 400;
    throw err;
  }

  return prisma.reviews.update({
    where: { review_id: id },
    data,
    include: {
      users: { select: { user_id: true, username: true, email: true } },
      websites: { select: { website_id: true, website_name: true, url: true } }
    }
  });
};

/** Delete a review; throws if not found. */
const deleteReview = async (id) => {
  const exists = await prisma.reviews.findUnique({ where: { review_id: id } });
  if (!exists) {
    const err = new Error("Review not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.reviews.delete({ where: { review_id: id } });
};

module.exports = { getAllReviews, getReviewById, createReview, updateReview, deleteReview };
