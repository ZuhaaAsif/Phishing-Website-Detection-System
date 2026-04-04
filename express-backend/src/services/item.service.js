/**
 * src/services/item.service.js
 * Business logic layer for Items.
 * Controllers call these functions; they never touch req/res directly.
 */
const prisma = require("./db.service");

/** Return all items, newest first. Supports optional pagination. */
const getAllItems = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true, email: true } } },
    }),
    prisma.item.count(),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

/** Return a single item by ID, or null if not found. */
const getItemById = async (id) =>
  prisma.item.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

/** Create and return a new item. */
const createItem = async ({ title, description, published = false, authorId }) =>
  prisma.item.create({
    data: { title, description, published, authorId },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

/** Update an existing item; throws if not found. */
const updateItem = async (id, data) => {
  const exists = await prisma.item.findUnique({ where: { id } });
  if (!exists) {
    const err = new Error("Item not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.item.update({
    where: { id },
    data,
    include: { author: { select: { id: true, name: true, email: true } } },
  });
};

/** Delete an item; throws if not found. */
const deleteItem = async (id) => {
  const exists = await prisma.item.findUnique({ where: { id } });
  if (!exists) {
    const err = new Error("Item not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.item.delete({ where: { id } });
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem };
