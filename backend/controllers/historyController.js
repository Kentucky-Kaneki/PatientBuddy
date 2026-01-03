import Member from "../models/Member.js";

export const getUserHistory = async (req, res) => {
  try {
    const { memberId, search = "", type = "all" } = req.query;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "memberId is required",
      });
    }

    let history = [];

    /* ================= REPORTS ================= */
    if (type === "all" || type === "report") {
      const member = await Member.findById(memberId)
        .populate('reports', 'fileName summary keyFindings recommendations uploadDate')
        .lean();

      const reports = (member.reports || [])
        .filter(r => search === '' || (r.fileName && r.fileName.match(new RegExp(search, 'i'))))
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      history.push(
        ...reports.map((r) => ({
          id: r._id,
          type: "report",
          title: r.fileName,
          summary: r.summary,
          recommendations: r.recommendations,
          highlights: r.keyFindings ? [r.keyFindings] : [],
          date: r.uploadDate,
          lab: "Uploaded Report"
        }))
      );
    }

    /* ================= PRESCRIPTIONS ================= */
    if (type === "all" || type === "prescription") {
      const member = await Member.findById(memberId)
        .populate('prescriptions', 'symptoms findings medications createdAt')
        .lean();

      const prescriptions = (member.prescriptions || [])
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      history.push(
        ...prescriptions.map((p) => ({
          id: p._id,
          type: "prescription",
          title: "Doctor Prescription",
          symptoms: p.symptoms,
          findings: p.findings,
          date: p.createdAt,
          lab: "Prescription",
          medications: p.medications.map(
            (m) => `${m.name} ${m.dosage}`
          ),
        }))
      );
    }

    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    console.error("❌ HISTORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
