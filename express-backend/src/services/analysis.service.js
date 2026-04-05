console.log("🔥🔥🔥 LOADING analysis.service.js from:", __filename);

const axios = require('axios');

class AnalysisService {
  // URL Heuristics - checks for suspicious patterns
  analyzeURL(url) {
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
    
    // Check 6: HTTPS missing (for non-IP URLs)
    if (!url.match(/https:\/\//) && !url.match(/https?:\/\/\d+\.\d+\.\d+\.\d+/)) {
      heuristicScore += 15;
      issues.push("Missing HTTPS - connection not secure");
    }
    
    return { 
      score: Math.min(100, heuristicScore), 
      issues,
      issueCount: issues.length
    };
  }

  // Calculate authenticity score
  calculateAuthenticityScore(heuristicScore, externalResults = null) {
    let score = 100 - heuristicScore;
    
    // If external API results exist, adjust score
    if (externalResults) {
      // Google Safe Browsing - subtract 50 if flagged (significant penalty)
      if (externalResults.googleSafeBrowsing && !externalResults.googleSafeBrowsing.safe) {
        score -= 50;
      }
      // Domain age - subtract 30 if recent (optional - add later)
      if (externalResults.domainAge && externalResults.domainAge.is_recent) {
        score -= 30;
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // Map score to risk status
  getRiskStatus(score) {
    if (score < 40) {
      return {
        status: "UNSAFE",
        color: "red",
        icon: "⚠️",
        message: "This website appears to be malicious. Do not proceed.",
        action: "BLOCK"
      };
    } else if (score >= 40 && score <= 70) {
      return {
        status: "SUSPICIOUS",
        color: "yellow",
        icon: "🔍",
        message: "This website shows suspicious signs. Proceed with caution.",
        action: "WARN"
      };
    } else {
      return {
        status: "SAFE",
        color: "green",
        icon: "✅",
        message: "This website appears to be legitimate.",
        action: "ALLOW"
      };
    }
  }

  // Generate recommendations based on risk status and findings
  generateRecommendations(riskStatus, issues) {
    const recommendations = [];
    
    if (riskStatus.status === "UNSAFE") {
      recommendations.push("Do NOT visit this website");
      recommendations.push("Do not enter any personal information");
      recommendations.push("Report this URL to security team");
      recommendations.push("Close this page immediately");
    } else if (riskStatus.status === "SUSPICIOUS") {
      recommendations.push("Avoid entering sensitive information");
      recommendations.push("Double-check the URL carefully");
      recommendations.push("Look for HTTPS padlock icon");
      recommendations.push("Verify website legitimacy through official channels");
    } else {
      recommendations.push("Website appears safe to visit");
      recommendations.push("Always keep your browser updated");
      recommendations.push("Use antivirus software for additional protection");
    }
    
    // Add specific recommendations based on issues found
    if (issues.some(issue => issue.includes("IP address"))) {
      recommendations.push("Legitimate websites rarely use IP addresses as domains");
    }
    if (issues.some(issue => issue.includes("@ symbol"))) {
      recommendations.push("The '@' symbol in URLs is a known phishing trick");
    }
    if (issues.some(issue => issue.includes("Missing HTTPS"))) {
      recommendations.push("Avoid entering passwords on non-HTTPS websites");
    }
    
    return recommendations;
  }

    // NEW METHOD: Check Google Safe Browsing API
  async checkGoogleSafeBrowsing(url) {
    console.log("🔍🔍🔍 Google API method was CALLED! 🔍🔍🔍");
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    
    if (!apiKey) {
      console.log("⚠️ No Google Safe Browsing API key found in .env");
      return { 
        safe: true, 
        error: "API key not configured",
        message: "Add GOOGLE_SAFE_BROWSING_API_KEY to .env file"
      };
    }
    
    try {
      const axios = require('axios');
      const requestBody = {
        client: {
          clientId: "phishing-detection-app",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION"
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: url }]
        }
      };
      
      console.log(`🔍 Checking Google Safe Browsing for: ${url}`);
      
      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.matches && response.data.matches.length > 0) {
        const match = response.data.matches[0];
        console.log(`⚠️ Google Safe Browsing flagged URL as: ${match.threatType}`);
        return {
          safe: false,
          threatType: match.threatType,
          message: `URL flagged as ${match.threatType}`,
          platform: match.platformType
        };
      }
      
      console.log(`✅ Google Safe Browsing: URL is clean`);
      return { 
        safe: true, 
        message: "URL not found in threat database" 
      };
      
    } catch (error) {
      console.error("❌ Google Safe Browsing API error:", error.response?.data || error.message);
      return { 
        safe: true, 
        error: "API call failed",
        message: "Unable to verify with Google Safe Browsing"
      };
    }
  }

  // NEW METHOD: Extract domain from URL
  extractDomain(url) {
    try {
      let domain = url.replace(/^https?:\/\//i, '');
      domain = domain.split('/')[0];
      domain = domain.split(':')[0];
      return domain;
    } catch (error) {
      return url;
    }
  }

  // Main analysis method - orchestrates everything
    // Main analysis method - orchestrates everything (UPDATED with external APIs)
  async analyzeWebsite(url) {
    // Step 1: Run heuristic analysis
    const heuristic = this.analyzeURL(url);
    
    // Step 2: Call Google Safe Browsing API
    const googleResult = await this.checkGoogleSafeBrowsing(url);
    
    // Step 3: Prepare external results
    const externalResults = {
      googleSafeBrowsing: googleResult,
      domainAge: null  // You can add WHOIS API later
    };
    
    // Step 4: Calculate score with external API results
    let authenticityScore = this.calculateAuthenticityScore(heuristic.score, externalResults);
    
    // Step 5: Get risk status
    const riskStatus = this.getRiskStatus(authenticityScore);
    
    // Step 6: Generate recommendations
    let recommendations = this.generateRecommendations(riskStatus, heuristic.issues);
    
    // Step 7: Add Google-specific recommendation if flagged
    if (googleResult && !googleResult.safe) {
      recommendations.unshift(`⚠️ Google Safe Browsing Alert: ${googleResult.message}`);
      recommendations.unshift("This URL has been reported to Google as potentially harmful");
    }
    
    // Step 8: Return complete analysis
    return {
      url,
      authenticity_score: authenticityScore,
      risk_status: riskStatus.status,
      risk_color: riskStatus.color,
      risk_icon: riskStatus.icon,
      risk_message: riskStatus.message,
      risk_action: riskStatus.action,
      analysis_details: {
        url_heuristics: {
          score: heuristic.score,
          issues_found: heuristic.issues,
          issue_count: heuristic.issueCount
        },
        google_safe_browsing: {
          status: googleResult.safe ? "clean" : "malicious",
          message: googleResult.message,
          threat_type: googleResult.threatType || null
        }
      },
      recommendations,
      analyzed_at: new Date().toISOString()
    };
  }

  // NEW METHOD 1: Extract domain from URL
  extractDomain(url) {
    try {
      // Remove protocol (http://, https://)
      let domain = url.replace(/^https?:\/\//i, '');
      // Remove path, query, fragment
      domain = domain.split('/')[0];
      // Remove port if present
      domain = domain.split(':')[0];
      return domain;
    } catch (error) {
      return url;
    }
  }

  // NEW METHOD 2: Detect leet speak and typosquatting
  detectTyposquatting(url) {
    const domain = this.extractDomain(url);
    const domainLower = domain.toLowerCase();
    
    let score = 0;
    const issues = [];
    
    // Pattern 1: Number-letter substitution (leet speak)
    const leetPatterns = [
      { pattern: /0/g, meaning: 'o', example: 'g00gle' },
      { pattern: /1/g, meaning: 'l', example: 'g00g1e' },
      { pattern: /3/g, meaning: 'e', example: 'goog13' },
      { pattern: /5/g, meaning: 's', example: '5ecure' },
      { pattern: /7/g, meaning: 't', example: '7rust' },
      { pattern: /4/g, meaning: 'a', example: '4ccount' },
      { pattern: /8/g, meaning: 'b', example: '8anking' },
      { pattern: /@/g, meaning: 'a', example: '@dmin' },
      { pattern: /\$/g, meaning: 's', example: '$ecure' }
    ];
    
    leetPatterns.forEach(({ pattern, meaning, example }) => {
      if (pattern.test(domainLower)) {
        score += 15;
        issues.push(`Contains leet speak (${example}) - possible typosquatting attempt`);
      }
    });
    
    // Pattern 2: Repeated characters (pppaypal.com, gmail.coom)
    if (/([a-z])\1{2,}/.test(domainLower)) {
      score += 20;
      issues.push("Contains repeated characters - possible typosquatting (e.g., 'pppaypal')");
    }
    
    // Pattern 3: Character substitution (rn → m, vv → w)
    const substitutions = [
      { pattern: /rn/g, looksLike: 'm', example: 'corn → com' },
      { pattern: /vv/g, looksLike: 'w', example: 'vvww → www' },
      { pattern: /cl/g, looksLike: 'd', example: 'clic → dic' }
    ];
    
    substitutions.forEach(({ pattern, looksLike, example }) => {
      if (pattern.test(domainLower)) {
        score += 10;
        issues.push(`Contains character substitution (${example}) - possible typosquatting`);
      }
    });
    
    // Pattern 4: Double letters where they shouldn't be
    const doubleLetterPatterns = ['aa', 'bb', 'cc', 'dd', 'ff', 'gg', 'hh', 'jj', 'kk', 'll', 'mm', 'nn', 'pp', 'qq', 'rr', 'ss', 'tt', 'uu', 'vv', 'ww', 'xx', 'yy', 'zz'];
    doubleLetterPatterns.forEach(double => {
      if (domainLower.includes(double)) {
        score += 5;
        issues.push(`Contains unusual double letter '${double}' - possible typosquatting`);
      }
    });
    
    return {
      score: Math.min(100, score),
      issues,
      hasTyposquatting: issues.length > 0,
      domain
    };
  }

  // NEW METHOD 3: Enhanced URL analysis that includes typosquatting
  analyzeURLWithTyposquatting(url) {
    // Get basic heuristic results
    const basicAnalysis = this.analyzeURL(url);
    
    // Get typosquatting detection results
    const typosquattingAnalysis = this.detectTyposquatting(url);
    
    // Combine scores (capped at 100)
    let totalScore = basicAnalysis.score + typosquattingAnalysis.score;
    totalScore = Math.min(100, totalScore);
    
    // Combine all issues
    const allIssues = [...basicAnalysis.issues, ...typosquattingAnalysis.issues];
    
    return {
      score: totalScore,
      issues: allIssues,
      issueCount: allIssues.length,
      breakdown: {
        basic_heuristics: basicAnalysis.score,
        typosquatting: typosquattingAnalysis.score
      },
      hasTyposquatting: typosquattingAnalysis.hasTyposquatting,
      domain: typosquattingAnalysis.domain
    };
  }
}

module.exports = AnalysisService;