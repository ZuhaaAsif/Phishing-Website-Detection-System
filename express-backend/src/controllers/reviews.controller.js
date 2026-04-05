/**
 * src/controllers/reviews.controller.js
 * Handles HTTP concerns (req, res) and delegates to reviews.service.js.
 * Keep controllers thin — no business logic here.
 */
const reviewService = require("../services/reviews.service");

const getAll = async (req, res, next) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(Number(req.params.id));
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(Number(req.params.id), req.body);
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await reviewService.deleteReview(Number(req.params.id));
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
