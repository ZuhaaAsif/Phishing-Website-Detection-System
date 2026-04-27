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
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false, 
                    error: errors.array()[0].msg 
                });
            }

            let { url } = req.body;
            
            // Ensure URL has protocol
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            console.log(`🔍 Analyzing website for frontend: ${url}`);
            
            // Use your existing analysis service
            const analysisResult = await analysisService.analyzeWebsite(url);
            
            // Transform response for frontend display
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

module.exports = router;