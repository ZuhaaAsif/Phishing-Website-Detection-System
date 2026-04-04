/**
 * src/services/user.service.js
 * Business logic layer for Users.
 */
const prisma = require("./db.service");

const getAllUsers = async () =>
  prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

const getUserById = async (id) =>
  prisma.user.findUnique({
    where: { id },
    include: { items: { orderBy: { createdAt: "desc" } } },
  });

const createUser = async ({ name, email }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }
  return prisma.user.create({ data: { name, email } });
};

const updateUser = async (id, data) => {
  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.user.update({ where: { id }, data });
};

const deleteUser = async (id) => {
  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.user.delete({ where: { id } });
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
