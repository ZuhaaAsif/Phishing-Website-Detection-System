/**
 * src/services/user.service.js
 * Business logic layer for Users.
 * Schema: user_id, username, email, last_active
 */
const prisma = require("./db.service");

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

const createUser = async ({ username, email, last_active }) => {
  // Check if email already exists
  const existing = await prisma.users.findUnique({ 
    where: { email } 
  });
  
  if (existing) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }
  
  // Create new user
  return prisma.users.create({ 
    data: { 
      username, 
      email, 
      last_active: last_active || new Date().toTimeString().split(' ')[0]
    } 
  });
};

const updateUser = async (id, data) => {
  // Check if user exists
  const exists = await prisma.users.findUnique({ 
    where: { user_id: id } 
  });
  
  if (!exists) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  
  // Update user
  return prisma.users.update({ 
    where: { user_id: id }, 
    data: {
      username: data.username,
      email: data.email,
      last_active: data.last_active
    }
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

module.exports = { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
};