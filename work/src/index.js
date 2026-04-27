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

// ========== PHISHING DETECTION ANALYSIS ==========

// Helper function: URL Heuristics
function analyzeURL(url) {
  let heuristicScore = 0;
  const issues = [];
  
  // Check 1: IP address instead of domain
  if (url.match(/https?:\/\/\d+\.\d+\.\d+\.\d+/)) {
    heuristicScore += 30;
    issues.push("Uses IP address instead of domain name");
  }
  
  // Check 2: Contains @ symbol
  if (url.includes('@')) {
    heuristicScore += 40;
    issues.push("Contains '@' symbol - URL trickery");
  }
  
  // Check 3: Excessive hyphens
  const hyphenCount = (url.match(/-/g) || []).length;
  if (hyphenCount > 2) {
    heuristicScore += Math.min(20, hyphenCount * 5);
    issues.push("Multiple hyphens in domain");
  }
  
  // Check 4: Very long URL
  if (url.length > 100) {
    heuristicScore += 15;
    issues.push("Unusually long URL");
  }
  
  // Check 5: Suspicious keywords
  const suspiciousKeywords = ['login', 'verify', 'secure', 'account', 'update', 'confirm'];
  suspiciousKeywords.forEach(keyword => {
    if (url.toLowerCase().includes(keyword)) {
      heuristicScore += 10;
      issues.push(`Contains suspicious keyword: ${keyword}`);
    }
  });
  
  return { score: Math.min(100, heuristicScore), issues };
}

// Helper function: Get risk status
function getRiskStatus(score) {
  if (score < 40) {
    return {
      status: "UNSAFE",
      color: "red",
      icon: "⚠️",
      message: "This website appears to be malicious. Do not proceed."
    };
  } else if (score >= 40 && score <= 70) {
    return {
      status: "SUSPICIOUS",
      color: "yellow",
      icon: "🔍",
      message: "This website shows suspicious signs. Proceed with caution."
    };
  } else {
    return {
      status: "SAFE",
      color: "green",
      icon: "✅",
      message: "This website appears to be legitimate."
    };
  }
}

// POST /api/analyze - Analyze a URL for phishing (WITH GOOGLE API)
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  const axios = require('axios');
  
  // Validate input
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: "URL is required" 
    });
  }
  
  try {
    console.log("\n🚀 Analyzing URL:", url);
    
    // ========== HEAURISTICS ANALYSIS ==========
    let heuristicScore = 0;
    const issues = [];
    
    if (url.match(/https?:\/\/\d+\.\d+\.\d+\.\d+/)) {
      heuristicScore += 30;
      issues.push("Uses IP address instead of domain name");
    }
    if (url.includes('@')) {
      heuristicScore += 40;
      issues.push("Contains '@' symbol - URL trickery");
    }
    const hyphenCount = (url.match(/-/g) || []).length;
    if (hyphenCount > 2) {
      heuristicScore += Math.min(20, hyphenCount * 5);
      issues.push("Multiple hyphens in domain");
    }
    if (url.length > 100) {
      heuristicScore += 15;
      issues.push("Unusually long URL");
    }
    const suspiciousKeywords = ['login', 'verify', 'secure', 'account', 'update', 'confirm'];
    suspiciousKeywords.forEach(keyword => {
      if (url.toLowerCase().includes(keyword)) {
        heuristicScore += 10;
        issues.push(`Contains suspicious keyword: ${keyword}`);
      }
    });
    if (!url.match(/https:\/\//) && !url.match(/https?:\/\/\d+\.\d+\.\d+\.\d+/)) {
      heuristicScore += 15;
      issues.push("Missing HTTPS - connection not secure");
    }
    heuristicScore = Math.min(100, heuristicScore);
    console.log("📊 Heuristic score:", heuristicScore);
    
    // ========== GOOGLE SAFE BROWSING API ==========
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    let googleResult = { safe: true, status: "no_key", message: "Google API not configured" };
    
    if (apiKey && apiKey !== 'your_api_key_here') {
      try {
        console.log("🔍 Calling Google Safe Browsing API...");
        const response = await axios.post(
          `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
          {
            client: { clientId: "phishing-detector", clientVersion: "1.0" },
            threatInfo: {
              threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [{ url: url }]
            }
          }
        );
        
        if (response.data.matches && response.data.matches.length > 0) {
          googleResult = {
            safe: false,
            status: "malicious",
            message: `URL flagged as ${response.data.matches[0].threatType}`,
            threat_type: response.data.matches[0].threatType
          };
          console.log("⚠️ Google flagged as:", googleResult.threat_type);
        } else {
          googleResult = {
            safe: true,
            status: "clean",
            message: "URL not found in threat database",
            threat_type: null
          };
          console.log("✅ Google: URL is clean");
        }
      } catch (error) {
        console.log("❌ Google API error:", error.response?.data || error.message);
        googleResult = {
          safe: true,
          status: "error",
          message: "Google API error - unable to verify",
          threat_type: null
        };
      }
    } else {
      console.log("⚠️ No valid Google API key found");
    }
    
    // ========== CALCULATE AUTHENTICITY SCORE ==========
    let authenticityScore = 100 - heuristicScore;
    if (!googleResult.safe) {
      authenticityScore -= 50;
    }
    authenticityScore = Math.max(0, Math.min(100, authenticityScore));

    // Check for typosquatting patterns (leet speak)
    const hasTyposquatting = /[0-9]/.test(url) && 
    (url.toLowerCase().includes('google') || 
    url.toLowerCase().includes('paypal') ||
    url.toLowerCase().includes('facebook') ||
    url.toLowerCase().includes('amazon'));

  // If typosquatting is detected, ensure score is at most 60 (SUSPICIOUS)
  if (hasTyposquatting && !googleResult.safe) {
    authenticityScore = Math.min(authenticityScore, 60);
    console.log("⚠️ Typosquatting detected - capping score at 60");
  }
    console.log("📊 Final score:", authenticityScore);
    
    // ========== GET RISK STATUS ==========
    let riskStatus, riskColor, riskIcon, riskMessage;
    if (authenticityScore < 40) {
      riskStatus = "UNSAFE";
      riskColor = "red";
      riskIcon = "⚠️";
      riskMessage = "This website appears to be malicious. Do not proceed.";
    } else if (authenticityScore >= 40 && authenticityScore <= 70) {
      riskStatus = "SUSPICIOUS";
      riskColor = "orange";
      riskIcon = "🔍";
      riskMessage = "This website shows suspicious signs. Proceed with caution.";
    } else {
      riskStatus = "SAFE";
      riskColor = "green";
      riskIcon = "✅";
      riskMessage = "This website appears to be legitimate.";
    }
    
    // ========== GENERATE RECOMMENDATIONS ==========
    let recommendations = [];
    if (!googleResult.safe) {
      recommendations.push(`⚠️ ${googleResult.message}`);
    }
    if (riskStatus === "UNSAFE") {
      recommendations.push("Do NOT visit this website", "Do not enter any personal information", "Report this URL to security team");
    } else if (riskStatus === "SUSPICIOUS") {
      recommendations.push("Avoid entering sensitive information", "Double-check the URL carefully", "Look for HTTPS padlock icon");
    } else {
      recommendations.push("Website appears safe to visit", "Always keep your browser updated");
    }
    
    // ========== RETURN RESPONSE ==========
    res.json({
      success: true,
      analysis: {
        url: url,
        authenticity_score: authenticityScore,
        risk_status: riskStatus,
        risk_color: riskColor,
        risk_icon: riskIcon,
        risk_message: riskMessage,
        analysis_details: {
          url_heuristics: {
            score: heuristicScore,
            issues_found: issues,
            issue_count: issues.length
          },
          google_safe_browsing: {
            status: googleResult.status,
            message: googleResult.message,
            threat_type: googleResult.threat_type || null
          }
        },
        recommendations: recommendations,
        analyzed_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== DIRECT GOOGLE SAFE BROWSING TEST ==========
app.post('/direct-test', async (req, res) => {
  const axios = require('axios');
  const { url } = req.body;
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  
  console.log("\n🧪 DIRECT TEST CALLED");
  console.log("   URL:", url);
  console.log("   API Key from env:", apiKey ? `${apiKey.substring(0, 20)}...` : "❌ NOT FOUND");
  
  if (!apiKey) {
    return res.status(400).json({ 
      success: false, 
      error: "GOOGLE_SAFE_BROWSING_API_KEY not found in .env file"
    });
  }
  
  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: {
          clientId: "phishing-detector",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: url }]
        }
      }
    );
    
    console.log("   Google API Response:", JSON.stringify(response.data, null, 2));
    
    if (response.data.matches && response.data.matches.length > 0) {
      console.log("   ✅ URL is MALICIOUS!");
      res.json({
        success: true,
        malicious: true,
        threatType: response.data.matches[0].threatType,
        message: `⚠️ URL flagged as ${response.data.matches[0].threatType}`
      });
    } else {
      console.log("   ✅ URL is clean");
      res.json({
        success: true,
        malicious: false,
        message: "✅ URL is clean according to Google Safe Browsing"
      });
    }
  } catch (error) {
    console.log("   ❌ API Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});