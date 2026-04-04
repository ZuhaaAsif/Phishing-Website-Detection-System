/**
 * src/controllers/item.controller.js
 * Handles HTTP concerns (req, res) and delegates to item.service.js.
 * Keep controllers thin — no business logic here.
 */
const itemService = require("../services/item.service");

const getAll = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await itemService.getAllItems({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const item = await itemService.getItemById(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const item = await itemService.createItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const item = await itemService.updateItem(Number(req.params.id), req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await itemService.deleteItem(Number(req.params.id));
    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
