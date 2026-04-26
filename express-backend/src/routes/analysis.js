console.log("🔴🔴🔴 ROUTES FILE IS LOADING 🔴🔴🔴");
const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysis.controller');

const analysisController = new AnalysisController();

//debug statement
console.log("✅ LOADING ANALYSIS ROUTE - using file from:", __filename);

// POST /api/analyze - Analyze a URL for phishing detection
router.post('/analyze', (req, res) => analysisController.analyzeUrl(req, res));

// Optional: GET /api/analyze/health - Check if analysis service is working
router.get('/analyze/health', (req, res) => {
  res.json({
    success: true,
    message: "Analysis service is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;