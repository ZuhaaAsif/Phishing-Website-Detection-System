/**
 * src/controllers/websites.controller.js
 * Handles HTTP concerns (req, res) and delegates to websites.service.js.
 * Keep controllers thin — no business logic here.
 */
const websiteService = require("../services/websites.service");

const getAll = async (req, res, next) => {
  try {
    const websites = await websiteService.getAllWebsites();
    res.json({ success: true, data: websites });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const website = await websiteService.getWebsiteById(Number(req.params.id));
    if (!website) return res.status(404).json({ success: false, message: "Website not found" });
    res.json({ success: true, data: website });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const website = await websiteService.createWebsite(req.body);
    res.status(201).json({ success: true, data: website });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const website = await websiteService.updateWebsite(Number(req.params.id), req.body);
    res.json({ success: true, data: website });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await websiteService.deleteWebsite(Number(req.params.id));
    res.json({ success: true, message: "Website deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };