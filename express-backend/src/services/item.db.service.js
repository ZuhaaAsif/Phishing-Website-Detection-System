const prisma = require("../utils/prisma");

// ─────────────────────────────────────────────────────────────────────────────
//  DATABASE SERVICE  — thin wrappers around Prisma.
//  Keep Prisma calls here; never import prisma directly in controllers/routes.
//  ADD YOUR OWN MODEL SERVICES in separate files following this same pattern.
// ─────────────────────────────────────────────────────────────────────────────

const findAll = ({ skip = 0, take = 20 } = {}) =>
  prisma.item.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

const count = () => prisma.item.count();

const findById = (id) =>
  prisma.item.findUnique({ where: { id } });

const create = (data) =>
  prisma.item.create({ data });

const update = (id, data) =>
  prisma.item.update({ where: { id }, data });

const remove = (id) =>
  prisma.item.delete({ where: { id } });

module.exports = { findAll, count, findById, create, update, remove };
