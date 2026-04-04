const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: "API is running!", 
    endpoints: {
      users: "/api/users",
      websites: "/api/websites", 
      reviews: "/api/reviews"
    }
  });
});

// ========== USER CRUD OPERATIONS ==========

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany();  // ← Must be 'users' not 'Users'
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single user
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: parseInt(id) },  // ← 'user_id' not 'User_ID'
      include: { reviews: true }          // ← 'reviews' not 'Reviews'
    });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE user
app.post('/api/users', async (req, res) => {
  const { username, email, last_active } = req.body;  // ← lowercase field names
  try {
    const newUser = await prisma.users.create({
      data: { 
        username: username,      // ← 'username' not 'UserName'
        email: email,            // ← 'email' not 'Email'
        last_active: last_active // ← 'last_active' not 'Last_Active'
      }
    });
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, last_active } = req.body;
  try {
    const updatedUser = await prisma.users.update({
      where: { user_id: parseInt(id) },  // ← 'user_id'
      data: { 
        username: username,
        email: email,
        last_active: last_active
      }
    });
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.users.delete({
      where: { user_id: parseInt(id) }  // ← 'user_id'
    });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ========== WEBSITE CRUD OPERATIONS ==========

// GET all websites
app.get('/api/websites', async (req, res) => {
  try {
    const websites = await prisma.websites.findMany();  // ← 'websites' not 'Websites'
    res.json({ success: true, data: websites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single website
app.get('/api/websites/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const website = await prisma.websites.findUnique({
      where: { website_id: parseInt(id) },  // ← 'website_id'
      include: { reviews: true }             // ← 'reviews'
    });
    if (!website) return res.status(404).json({ success: false, error: "Website not found" });
    res.json({ success: true, data: website });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE website
app.post('/api/websites', async (req, res) => {
  const { website_name, security_rate } = req.body;  // ← lowercase snake_case
  try {
    const newWebsite = await prisma.websites.create({
      data: { 
        website_name: website_name,    // ← 'website_name'
        security_rate: security_rate   // ← 'security_rate'
      }
    });
    res.status(201).json({ success: true, data: newWebsite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE website
app.put('/api/websites/:id', async (req, res) => {
  const { id } = req.params;
  const { website_name, security_rate } = req.body;
  try {
    const updatedWebsite = await prisma.websites.update({
      where: { website_id: parseInt(id) },  // ← 'website_id'
      data: { 
        website_name: website_name,
        security_rate: security_rate
      }
    });
    res.json({ success: true, data: updatedWebsite });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE website
app.delete('/api/websites/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.websites.delete({
      where: { website_id: parseInt(id) }  // ← 'website_id'
    });
    res.json({ success: true, message: "Website deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ========== REVIEW CRUD OPERATIONS ==========

// GET all reviews (with user and website info)
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await prisma.reviews.findMany({
      include: {
        users: true,     // ← 'users' not 'Users'
        websites: true   // ← 'websites' not 'Websites'
      }
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single review
app.get('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const review = await prisma.reviews.findUnique({
      where: { review_id: parseInt(id) },  // ← 'review_id'
      include: {
        users: true,
        websites: true
      }
    });
    if (!review) return res.status(404).json({ success: false, error: "Review not found" });
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE review
app.post('/api/reviews', async (req, res) => {
  const { review, website_id, user_id, rate } = req.body;  // ← lowercase
  
  if (rate < 1 || rate > 5) {
    return res.status(400).json({ 
      success: false, 
      error: "Rate must be between 1 and 5" 
    });
  }
  
  try {
    const newReview = await prisma.reviews.create({
      data: {
        review: review,           // ← 'review'
        website_id: website_id,   // ← 'website_id'
        user_id: user_id,         // ← 'user_id'
        rate: rate                // ← 'rate'
      }
    });
    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE review
app.put('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { review, rate } = req.body;
  
  if (rate && (rate < 1 || rate > 5)) {
    return res.status(400).json({ 
      success: false, 
      error: "Rate must be between 1 and 5" 
    });
  }
  
  try {
    const updatedReview = await prisma.reviews.update({
      where: { review_id: parseInt(id) },  // ← 'review_id'
      data: { 
        review: review,
        rate: rate
      }
    });
    res.json({ success: true, data: updatedReview });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE review
app.delete('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.reviews.delete({
      where: { review_id: parseInt(id) }  // ← 'review_id'
    });
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});