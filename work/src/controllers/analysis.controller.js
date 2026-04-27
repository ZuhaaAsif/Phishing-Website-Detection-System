const AnalysisService = require('../services/analysis.service');
const prisma = require('../services/db.service');

class AnalysisController {
  constructor() {
    this.analysisService = new AnalysisService();
  }

  async analyzeUrl(req, res, next) {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required',
          message: 'Please provide a URL to analyze',
        });
      }

      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format',
          message: 'Please provide a valid URL including http:// or https://',
        });
      }

      const analysis = await this.analysisService.analyzeWebsite(url);
      const domain = this.analysisService.extractDomain(url).replace(/^www\./i, '');
      const websiteName = domain;
      const security_rate = analysis.authenticity_score >= 70 ? 5 : analysis.authenticity_score >= 40 ? 3 : 1;
      const reputation = analysis.analysis_details.google_safe_browsing.status === 'malicious' ? 'malicious' : 'clean';

      const savedWebsite = await prisma.websites.upsert({
        where: { url },
        update: {
          website_name: websiteName,
          domain,
          riskScore: analysis.authenticity_score,
          security_rate,
          reputation,
          analysisDetails: analysis.analysis_details,
          lastChecked: new Date(),
        },
        create: {
          website_name: websiteName,
          url,
          domain,
          riskScore: analysis.authenticity_score,
          security_rate,
          reputation,
          analysisDetails: analysis.analysis_details,
        },
      });

      res.json({
        success: true,
        analysis,
        website: {
          website_id: savedWebsite.website_id,
          website_name: savedWebsite.website_name,
          url: savedWebsite.url,
          domain: savedWebsite.domain,
          riskScore: savedWebsite.riskScore,
          security_rate: savedWebsite.security_rate,
          reputation: savedWebsite.reputation,
          analysisDetails: savedWebsite.analysisDetails,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalysisController;
