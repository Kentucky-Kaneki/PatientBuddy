import Report from "../models/Report.js";
import Groq from "groq-sdk";

function limitText(text, maxChars = 6000) {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n[Context truncated]";
}

export const chatWithReports = async (req, res) => {
  try {
    console.log("📝 Chat request received");
    console.log("Body:", req.body);

    // Check if API key exists
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY is not set!");
      return res.status(500).json({
        success: false,
        error: "Server configuration error: GROQ_API_KEY missing",
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { userId, message } = req.body;

    if (!userId || !message) {
      console.log("❌ Missing userId or message");
      return res.status(400).json({
        success: false,
        error: "userId and message are required",
      });
    }

    console.log("🔍 Fetching reports for user:", userId);

    // 1️⃣ Fetch all reports for this patient
    const reports = await Report.find({ patient: userId })
      .sort({ uploadDate: -1 })
      .lean();

    console.log("📊 Found reports:", reports.length);

    if (!reports.length) {
      return res.json({
        success: true,
        answer:
          "I don't see any medical reports uploaded yet. Please upload a report so I can help explain it.",
      });
    }

    // 2️⃣ Build medical context (ONLY stored data)
    let context = reports
      .map(
        (r) => `
Report Date: ${new Date(r.uploadDate).toDateString()}

Summary:
${r.summary || "Not available"}

Key Findings:
${r.keyFindings || "Not available"}

Recommendations:
${r.recommendations || "Not available"}
`
      )
      .join("\n\n---------------------\n\n");
    
    context = limitText(context);

    // 3️⃣ Detect medicines mentioned in reports (TEXT-ONLY)
    const KNOWN_MEDICINES = [
      "paracetamol",
      "ibuprofen",
      "amoxicillin",
      "cetirizine",
      "dolo",
      "crocin",
      "calpol",
      "azithromycin",
      "pantoprazole",
    ];

    const allowedMedicines = new Set();

    reports.forEach((r) => {
      const text = `${r.summary} ${r.keyFindings} ${r.recommendations}`.toLowerCase();
      KNOWN_MEDICINES.forEach((med) => {
        if (text.includes(med)) allowedMedicines.add(med);
      });
    });

    console.log("💊 Allowed medicines:", [...allowedMedicines]);

    // 4️⃣ Safety-locked prompt
    const prompt = `
You are a medical information assistant.

STRICT SAFETY RULES:
- You are NOT a doctor.
- You MUST NOT prescribe medicines.
- You MUST NOT suggest dosages unless explicitly written in the report.
- You MUST NOT diagnose new conditions.
- You may ONLY discuss medicines if they appear in the reports.
- Allowed medicines: ${[...allowedMedicines].join(", ") || "None"}
- If asked about something unsafe, explain limitations politely.
- Always add a medical disclaimer at the end.

PATIENT MEDICAL CONTEXT (DO NOT INVENT ANYTHING):
${context}

USER QUESTION:
${message}

Respond clearly, safely, and in patient-friendly language.
`;

    console.log("🤖 Calling Groq API...");

    // 5️⃣ Call Groq (same model style as OCR)
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 700,
    });

    const answer = completion.choices[0]?.message?.content;

    console.log("✅ Response generated successfully");

    res.json({
      success: true,
      answer,
    });
  } catch (err) {
    console.error("❌ Chat error:", err);
    console.error("Error details:", err.message);
    console.error("Stack:", err.stack);
    
    res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};