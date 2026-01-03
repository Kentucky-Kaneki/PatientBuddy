import Report from "../models/Report.js";

export const getHealthInsights = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get the most recent report
    const latestReport = await Report.findOne({ patient: userId })
      .sort({ uploadDate: -1 })
      .lean();

    if (!latestReport) {
      return res.json({
        success: true,
        insights: [],
      });
    }

    // Extract insights from the report
    const insights = [];

    // Check for concerning findings
    if (latestReport.keyFindings) {
      const findings = latestReport.keyFindings.toLowerCase();
      
      // Vitamin D check
      if (findings.includes('vitamin d') && (findings.includes('low') || findings.includes('deficient'))) {
        insights.push({
          type: 'warning',
          title: 'Vitamin D Level',
          message: 'Your Vitamin D levels from your last test were below optimal range. Consider discussing supplementation with your healthcare provider.',
          date: latestReport.uploadDate,
          reportId: latestReport._id,
        });
      }

      // Cholesterol check
      if (findings.includes('cholesterol') && findings.includes('high')) {
        insights.push({
          type: 'warning',
          title: 'Cholesterol Alert',
          message: 'Your cholesterol levels are elevated. Review dietary recommendations with your doctor.',
          date: latestReport.uploadDate,
          reportId: latestReport._id,
        });
      }

      // Blood pressure check
      if (findings.includes('blood pressure') || findings.includes('hypertension')) {
        insights.push({
          type: 'warning',
          title: 'Blood Pressure',
          message: 'Your blood pressure readings require attention. Please follow up with your healthcare provider.',
          date: latestReport.uploadDate,
          reportId: latestReport._id,
        });
      }

      // Thyroid check
      if (findings.includes('thyroid') && (findings.includes('abnormal') || findings.includes('attention'))) {
        insights.push({
          type: 'attention',
          title: 'Thyroid Panel',
          message: 'Your thyroid test results need attention. Schedule a follow-up appointment with your doctor.',
          date: latestReport.uploadDate,
          reportId: latestReport._id,
        });
      }
    }

    // Check recommendations
    if (latestReport.recommendations && insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Health Recommendations',
        message: latestReport.recommendations.substring(0, 150) + '...',
        date: latestReport.uploadDate,
        reportId: latestReport._id,
      });
    }

    // If no specific insights, show positive message
    if (insights.length === 0 && latestReport.summary) {
      insights.push({
        type: 'success',
        title: 'Recent Test Results',
        message: 'Your recent test results look good. Keep maintaining your healthy lifestyle!',
        date: latestReport.uploadDate,
        reportId: latestReport._id,
      });
    }

    res.json({
      success: true,
      insights: insights.slice(0, 3), // Return max 3 insights
    });

  } catch (err) {
    console.error("Get insights error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};