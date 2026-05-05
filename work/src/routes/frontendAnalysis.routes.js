const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const AnalysisService = require("../services/analysis.service");

const router = Router();
const analysisService = new AnalysisService();

// Endpoint for frontend authentication workflow
router.post("/authenticate", 
    body("url").trim().isURL().withMessage("Please provide a valid URL"),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false, 
                    error: errors.array()[0].msg 
                });
            }

            let { url } = req.body;
            
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            console.log(`🔍 Analyzing website for frontend: ${url}`);
            
            const analysisResult = await analysisService.analyzeWebsite(url);
            
            const frontendResponse = {
                success: true,
                data: {
                    url: url,
                    authenticityScore: analysisResult.authenticity_score,
                    riskStatus: analysisResult.risk_status,
                    riskColor: analysisResult.risk_color,
                    riskIcon: analysisResult.risk_icon,
                    riskMessage: analysisResult.risk_message,
                    analyzedAt: analysisResult.analyzed_at,
                    details: {
                        urlHeuristics: {
                            score: analysisResult.analysis_details.url_heuristics.score,
                            issues: analysisResult.analysis_details.url_heuristics.issues_found,
                            issueCount: analysisResult.analysis_details.url_heuristics.issue_count,
                            typosquattingDetected: analysisResult.analysis_details.url_heuristics.typosquatting_detected
                        },
                        googleSafeBrowsing: {
                            status: analysisResult.analysis_details.google_safe_browsing.status,
                            message: analysisResult.analysis_details.google_safe_browsing.message,
                            threatType: analysisResult.analysis_details.google_safe_browsing.threat_type
                        }
                    },
                    recommendations: analysisResult.recommendations,
                    action: analysisResult.risk_action
                }
            };
            
            res.json(frontendResponse);
            
        } catch (error) {
            console.error("❌ Analysis error:", error);
            next(error);
        }
    }
);

// ONLY ONE check-exists endpoint - NO DNS, just simple fetch
router.post("/check-exists", async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ success: false, error: "URL is required" });
        }
        
        // Simple URL validation
        let cleanUrl = url;
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
            const response = await fetch(cleanUrl, {
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'follow'
            });
            
            clearTimeout(timeoutId);
            
            // Website exists if status is 200-399
            const exists = response.status >= 200 && response.status < 400;
            
            res.json({
                success: true,
                exists: exists,
                status: response.status
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);
            // Website doesn't exist or is unreachable
            res.json({
                success: true,
                exists: false
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;