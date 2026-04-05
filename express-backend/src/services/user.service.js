/**
 * src/services/user.service.js
 * Business logic layer for Users.
 * Schema: user_id, username, email, last_active
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("./db.service");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-secret";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "2h";

const getAllUsers = async () =>
  prisma.users.findMany({
    orderBy: { user_id: "asc" },
    select: { 
      user_id: true, 
      username: true, 
      email: true, 
      last_active: true 
    },
  });

const getUserById = async (id) =>
  prisma.users.findUnique({
    where: { user_id: id },
    include: { 
      reviews: {
        include: {
          websites: true
        }
      } 
    },
  });

const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, 10);

const createUser = async ({ username, email, password, last_active }) => {
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    throw err;
  }

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  return prisma.users.create({
    data: {
      username,
      email,
      password: hashedPassword,
      last_active: last_active ? new Date(last_active) : new Date(),
    },
    select: {
      user_id: true,
      username: true,
      email: true,
      last_active: true,
    },
  });
};

const updateUser = async (id, data) => {
  const exists = await prisma.users.findUnique({ where: { user_id: id } });
  if (!exists) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const updateData = {
    username: data.username,
    email: data.email,
    last_active: data.last_active ? new Date(data.last_active) : exists.last_active,
  };

  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  return prisma.users.update({
    where: { user_id: id },
    data: updateData,
    select: {
      user_id: true,
      username: true,
      email: true,
      last_active: true,
    },
  });
};

const deleteUser = async (id) => {
  // Check if user exists
  const exists = await prisma.users.findUnique({ 
    where: { user_id: id } 
  });
  
  if (!exists) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  
  // Delete user (reviews will be deleted due to cascade? If not, handle it)
  return prisma.users.delete({ where: { user_id: id } });
};

const generateToken = (user) =>
  jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

const authenticateUser = async ({ email, password }) => {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);
  return {
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      last_active: user.last_active,
    },
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
};