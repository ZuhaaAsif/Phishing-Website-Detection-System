/**
 * src/services/user.service.js
 * Business logic for user management - Matches your exact schema
 */
const prisma = require("./db.service");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to hash password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Create a new user
const createUser = async (userData) => {
    const { username, email, password, last_active } = userData;
    
    console.log(`Creating user: ${email}`);
    
    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
        where: {
            OR: [
                { email: email },
                { username: username }
            ]
        }
    });
    
    if (existingUser) {
        if (existingUser.email === email) {
            throw new Error("Email already in use");
        }
        if (existingUser.username === username) {
            throw new Error("Username already taken");
        }
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Prepare data - only fields that exist in your schema
    const data = {
        username: username,
        email: email,
        password: hashedPassword
    };
    
    // Add last_active only if provided
    if (last_active) {
        data.last_active = last_active;
    }
    
    // Create user
    const user = await prisma.users.create({
        data: data
    });
    
    // Return user without password
    return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        last_active: user.last_active
    };
};

// Authenticate user
const authenticateUser = async (credentials) => {
    const { email, password } = credentials;
    
    console.log(`Attempting login for email: ${email}`);
    
    // Find user by email
    const user = await prisma.users.findUnique({
        where: { email: email }
    });
    
    if (!user) {
        console.log(`User not found: ${email}`);
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }
    
    console.log(`User found: ${user.email}`);
    
    // Check if password exists
    if (!user.password) {
        console.error(`No password found for user: ${email}`);
        const error = new Error("Account not properly configured");
        error.statusCode = 401;
        throw error;
    }
    
    try {
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log(`Password validation result: ${isValidPassword}`);
        
        if (!isValidPassword) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            throw error;
        }
        
        // Update last_active (field exists in your schema)
        await prisma.users.update({
            where: { user_id: user.user_id },
            data: { last_active: new Date() }
        });
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                email: user.email,
                username: user.username 
            },
            process.env.JWT_SECRET || 'your-secret-key-change-this',
            { expiresIn: '7d' }
        );
        
        // Return user info (without password)
        return {
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                last_active: user.last_active
            }
        };
        
    } catch (bcryptError) {
        console.error('bcrypt comparison error:', bcryptError);
        const error = new Error("Authentication error");
        error.statusCode = 500;
        throw error;
    }
};

// Get user by ID
const getUserById = async (userId) => {
    const user = await prisma.users.findUnique({
        where: { user_id: userId }
    });
    
    if (!user) return null;
    
    // Return without password
    return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        last_active: user.last_active
    };
};

// Get user by email
const getUserByEmail = async (email) => {
    return prisma.users.findUnique({
        where: { email: email }
    });
};

// Get all users
const getAllUsers = async () => {
    const users = await prisma.users.findMany();
    
    // Return without passwords
    return users.map(user => ({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        last_active: user.last_active
    }));
};

// Update user
const updateUser = async (userId, userData) => {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
        where: { user_id: userId }
    });
    
    if (!existingUser) {
        throw new Error("User not found");
    }
    
    const updateData = {};
    
    if (userData.username) updateData.username = userData.username;
    if (userData.email) updateData.email = userData.email;
    if (userData.password) {
        updateData.password = await hashPassword(userData.password);
    }
    if (userData.last_active) updateData.last_active = userData.last_active;
    
    const user = await prisma.users.update({
        where: { user_id: userId },
        data: updateData
    });
    
    // Return without password
    return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        last_active: user.last_active
    };
};

// Delete user
const deleteUser = async (userId) => {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
        where: { user_id: userId }
    });
    
    if (!existingUser) {
        throw new Error("User not found");
    }
    
    // First delete any reviews by this user
    await prisma.reviews.deleteMany({
        where: { user_id: userId }
    });
    
    // Then delete the user
    return prisma.users.delete({
        where: { user_id: userId }
    });
};

module.exports = {
    createUser,
    authenticateUser,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUser,
    deleteUser
};