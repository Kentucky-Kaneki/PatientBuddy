// controllers/reportController.js
import mongoose from "mongoose";
import Report from "../models/Report.js";
import Chunk from "../models/Chunk.js";
import axios from "axios";

import { CloudClient } from "chromadb";

// ==========================================
// ChromaDB Client
// ==========================================


const chromaClient = new CloudClient({
  apiKey: 'ck-5Z8wR3DvJ5ikWMWGqXjuWThjEjkL7TfrErU3sNUZzLQx',
  tenant: 'aa344572-9b98-4886-b96d-dbd64f131057',
  database: 'patientbuddy'
});

// Get API key from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ==========================================
// Utility Functions
// ==========================================

async function generateEmbedding(text) {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      { inputs: text.substring(0, 512) },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.log("⚠️ Using fallback embedding");
    return generateSimpleEmbedding(text);
  }
}

function generateSimpleEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/).slice(0, 100);
  const freq = {};
  words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));

  const vocab = Object.keys(freq).slice(0, 384);
  const embedding = new Array(384).fill(0);
  vocab.forEach((w, i) => (embedding[i] = freq[w]));
  return embedding;
}

function chunkText(text, chunkSize = 500, overlap = 100) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunkWords = words.slice(i, i + chunkSize);
    if (chunkWords.length === 0) continue;

    chunks.push({
      text: chunkWords.join(" "),
      index: chunks.length,
      startWord: i,
      endWord: Math.min(i + chunkSize, words.length),
    });
  }

  return chunks;
}

function detectSection(text) {
  const t = text.toLowerCase();
  if (t.includes("patient") && (t.includes("age") || t.includes("name")))
    return "patient_info";
  if (t.includes("diagnosis")) return "diagnosis";
  if (t.includes("medication") || t.includes("prescription"))
    return "medications";
  if (t.includes("test") || t.includes("lab")) return "test_results";
  if (t.includes("vital")) return "vital_signs";
  if (t.includes("recommend")) return "recommendations";
  return "general";
}

// ==========================================
// Controllers
// ==========================================

export const uploadReport = async (req, res) => {
  try {
    const { patientId, fullText, fileName } = req.body;

    if (!patientId || !fullText) {
      return res.status(400).json({
        success: false,
        error: "Patient ID and text required",
      });
    }

    const reportId = new mongoose.Types.ObjectId();
    const collectionId = `report_${reportId.toString()}`;

    const report = new Report({
      _id: reportId,
      patient: patientId,
      fileName: fileName || "medical_report.pdf",
      fullText,
      collectionId,
      chunkCount: 0,
      processingStatus: 'processing'
    });

    await report.save();

    let collection;
    try {
      collection = await chromaClient.createCollection({
        name: collectionId,
        metadata: { reportId: report._id.toString() },
        embeddingFunction: null
      });
    } catch (err) {
      collection = await chromaClient.getCollection({
        name: collectionId,
        embeddingFunction: null
      });
    }

    const chunks = chunkText(fullText);
    report.chunkCount = chunks.length;

    const batchSize = 10;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const embeddings = await Promise.all(
        batch.map((c) => generateEmbedding(c.text))
      );

      await collection.add({
        ids: batch.map((c) => `chunk_${reportId}_${c.index}`),
        embeddings,
        documents: batch.map((c) => c.text),
        metadatas: batch.map((c) => ({
          reportId: reportId.toString(),
          section: detectSection(c.text),
          index: c.index,
        })),
      });

      await Chunk.insertMany(
        batch.map((c) => ({
          report: reportId,
          text: c.text,
          index: c.index,
          startWord: c.startWord,
          endWord: c.endWord,
          metadata: {
            section: detectSection(c.text),
          },
        }))
      );
    }

    report.processingStatus = 'completed';
    await report.save();

    res.json({
      success: true,
      reportId: reportId.toString(),
      collectionId,
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory rate limiter
let lastGroqCall = 0;
const MIN_GROQ_INTERVAL = 2000; // 2 seconds between calls

async function rateLimitedGroqCall(apiKey, payload) {
  const now = Date.now();
  const timeSinceLastCall = now - lastGroqCall;
  
  if (timeSinceLastCall < MIN_GROQ_INTERVAL) {
    await delay(MIN_GROQ_INTERVAL - timeSinceLastCall);
  }
  
  lastGroqCall = Date.now();
  
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );
    return response;
  } catch (error) {
    if (error.response?.status === 429) {
      // Wait longer and retry once
      console.log("Rate limited, waiting 5 seconds...");
      await delay(5000);
      return await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        payload,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
    }
    throw error;
  }
}

export const queryReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { query, topK = 5 } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: "Query is required"
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    const queryEmbedding = await generateEmbedding(query);
    const collection = await chromaClient.getCollection({
      name: report.collectionId,
      embeddingFunction: null
    });

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });

    const chunks = results.documents[0].map((doc, i) => ({
      text: doc,
      similarity: 1 - (results.distances[0][i] || 0),
      metadata: results.metadatas[0][i],
    }));

    const context = chunks.map(c => c.text).join("\n\n");

    const prompt = `Based on the following medical report excerpts, answer this question: "${query}"

Medical Report Context:
${context}

Provide a clear, accurate answer based only on the information given. If the information is not in the context, say so.`;

    const groqResponse = await rateLimitedGroqCall(GROQ_API_KEY, {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    });

    const answer = groqResponse.data.choices[0].message.content;

    res.json({
      success: true,
      answer,
      sources: chunks,
    });

  } catch (error) {
    console.error("Query error:", error);
    
    // Better error message for rate limiting
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: "API rate limit exceeded. Please wait a moment and try again.",
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const summarizeReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { groqApiKey } = req.body;

    const apiKey = groqApiKey || GROQ_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "GROQ API key is required"
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    const collection = await chromaClient.getCollection({
      name: report.collectionId,
      embeddingFunction: null
    });

    const queryEmbedding = await generateEmbedding(
      "patient information diagnosis findings treatment medications"
    );

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 10,
    });

    const context = results.documents[0].join("\n\n");

    const prompt = `Analyze the following medical report and provide a structured summary:

### Medical Report Summary

**Patient Information**
- Name:
- Age:
- Gender:

**Chief Complaint / Symptoms**
- 

**Diagnosis**
- 

**Medications Prescribed**
- 

**Tests / Investigations**
- 

**Recommendations**
- 

Medical Report:
${context}

Format the response clearly. If information is missing, write "Not mentioned".`;

    const response = await rateLimitedGroqCall(apiKey, {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 800,
    });

    const summary = response.data.choices[0].message.content;
    
    report.summary = summary;
    await report.save();

    res.json({
      success: true,
      summary,
      keyFindings: "Extracted from summary",
      recommendations: "See summary section"
    });
  } catch (error) {
    console.error("Summarize error:", error);
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: "API rate limit exceeded. Please wait a moment and try again.",
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        error: "Report not found" 
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getPatientReports = async (req, res) => {
  try {
    const reports = await Report.find({ 
      patient: req.params.patientId 
    }).sort({ uploadDate: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        error: "Report not found" 
      });
    }

    try {
      await chromaClient.deleteCollection({ name: report.collectionId });
    } catch (err) {
      console.log("ChromaDB collection already deleted or not found");
    }

    await Chunk.deleteMany({ report: report._id });
    await report.deleteOne();

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const conahealthCheck = async (req, res) => {
  let chroma = "disconnected";
  try {
    await chromaClient.heartbeat();
    chroma = "connected";
  } catch (err) {
    console.error("ChromaDB health check failed:", err.message);
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      chromadb: chroma,
    },
  });
};