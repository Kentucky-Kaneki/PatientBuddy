import Report from "../models/Report.js";
import Prescription from "../models/Prescription.js";

export const getUserHistory = async (req, res) => {
  try {
    const { userId, search = "", type = "all" } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    let history = [];

    /* ================= REPORTS ================= */
    if (type === "all" || type === "report") {
      const reports = await Report.find({
        patient: userId, // patient == userId (as per your data)
        fileName: { $regex: search, $options: "i" },
      })
        .sort({ uploadDate: -1 })
        .lean();

      history.push(
        ...reports.map((r) => ({
          id: r._id,
          type: "report",
          title: r.fileName,
          date: r.uploadDate,
          lab: "Uploaded Report",
          highlights: r.keyFindings ? [r.keyFindings] : [],
        }))
      );
    }

    /* ================= PRESCRIPTIONS ================= */
    if (type === "all" || type === "prescription") {
      const prescriptions = await Prescription.find({
        user: userId,
      })
        .sort({ createdAt: -1 })
        .lean();

      history.push(
        ...prescriptions.map((p) => ({
          id: p._id,
          type: "prescription",
          title: "Doctor Prescription",
          date: p.createdAt,
          lab: "Prescription",
          highlights: p.medications.map(
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
