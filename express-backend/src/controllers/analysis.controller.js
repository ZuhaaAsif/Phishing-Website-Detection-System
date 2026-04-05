console.log("🔥🔥🔥 USING UPDATED CONTROLLER WITH GOOGLE API 🔥🔥🔥");
const axios = require('axios');

class AnalysisController {
  async analyzeUrl(req, res) {
    try {
      const { url } = req.body;
      
      // Validate input
      if (!url) {
        return res.status(400).json({
          success: false,
          error: "URL is required",
          message: "Please provide a URL to analyze"
        });
      }
      
      // Validate URL format
      const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
      if (!urlPattern.test(url)) {
        return res.status(400).json({
          success: false,
          error: "Invalid URL format",
          message: "Please provide a valid URL including http:// or https://"
        });
      }
      
      console.log("\n🚀 Analyzing URL:", url);
      
      // ========== HEAURISTICS ANALYSIS ==========
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
      const suspiciousKeywords = ['login', 'verify', 'secure', 'account', 'update', 'confirm', 'signin'];
      suspiciousKeywords.forEach(keyword => {
        if (url.toLowerCase().includes(keyword)) {
          heuristicScore += 10;
          issues.push(`Contains suspicious keyword: ${keyword}`);
        }
      });
      
      // Check 6: Missing HTTPS
      if (!url.match(/https:\/\//) && !url.match(/https?:\/\/\d+\.\d+\.\d+\.\d+/)) {
        heuristicScore += 15;
        issues.push("Missing HTTPS - connection not secure");
      }
      
      heuristicScore = Math.min(100, heuristicScore);
      console.log("📊 Heuristic score:", heuristicScore);
      
      // ========== GOOGLE SAFE BROWSING API ==========
      const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
      let googleResult = { safe: true, message: "Not checked", status: "pending" };
      
      if (apiKey) {
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
            message: "Unable to verify with Google Safe Browsing",
            threat_type: null,
            error: error.message
          };
        }
      } else {
        console.log("⚠️ No Google API key found in .env");
        googleResult = {
          safe: true,
          status: "no_api_key",
          message: "Google Safe Browsing API key not configured",
          threat_type: null
        };
      }
      
      // ========== CALCULATE AUTHENTICITY SCORE ==========
      let authenticityScore = 100 - heuristicScore;
      if (!googleResult.safe) {
        authenticityScore -= 50;
      }
      authenticityScore = Math.max(0, Math.min(100, authenticityScore));
      console.log("📊 Final authenticity score:", authenticityScore);
      
      // ========== DETERMINE RISK STATUS ==========
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
      const recommendations = [];
      
      if (!googleResult.safe) {
        recommendations.push(`⚠️ Google Safe Browsing Alert: ${googleResult.message}`);
      }
      
      if (riskStatus === "UNSAFE") {
        recommendations.push("Do NOT visit this website");
        recommendations.push("Do not enter any personal information");
        recommendations.push("Report this URL to security team");
        recommendations.push("Close this page immediately");
      } else if (riskStatus === "SUSPICIOUS") {
        recommendations.push("Avoid entering sensitive information");
        recommendations.push("Double-check the URL carefully");
        recommendations.push("Look for HTTPS padlock icon");
        recommendations.push("Verify website legitimacy through official channels");
      } else {
        recommendations.push("Website appears safe to visit");
        recommendations.push("Always keep your browser updated");
        recommendations.push("Use antivirus software for additional protection");
      }
      
      // Add specific recommendations based on issues
      if (issues.some(issue => issue.includes("IP address"))) {
        recommendations.push("Legitimate websites rarely use IP addresses as domains");
      }
      if (issues.some(issue => issue.includes("@ symbol"))) {
        recommendations.push("The '@' symbol in URLs is a known phishing trick");
      }
      if (issues.some(issue => issue.includes("Missing HTTPS"))) {
        recommendations.push("Avoid entering passwords on non-HTTPS websites");
      }
      
      // ========== SEND RESPONSE ==========
      res.json({
        success: true,
        analysis: {
          url,
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
              threat_type: googleResult.threat_type
            }
          },
          recommendations,
          analyzed_at: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message
      });
    }
  }
}

module.exports = AnalysisController;