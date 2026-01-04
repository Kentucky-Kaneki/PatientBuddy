// controllers/reportController.js
import mongoose from "mongoose";
import Report from "../models/Report.js";
import Chunk from "../models/Chunk.js";
import Member from "../models/Member.js";
import axios from "axios";

import { CloudClient } from "chromadb";

export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found"
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ==========================================
// ChromaDB Client
// ==========================================

const chromaClient = new CloudClient({
  apiKey: 'ck-5Z8wR3DvJ5ikWMWGqXjuWThjEjkL7TfrErU3sNUZzLQx',
  tenant: 'aa344572-9b98-4886-b96d-dbd64f131057',
  database: 'patientbuddy'
});

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

    const embeddings = response.data[0];
    const embedding = Array.isArray(embeddings[0]) 
      ? embeddings.map(row => row[0]).slice(0, 384)
      : embeddings.slice(0, 384);
    
    return embedding;
  } catch (error) {
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
    const { memberId, fullText, fileName } = req.body;

    const reportId = new mongoose.Types.ObjectId();
    const collectionId = `report_${reportId.toString()}`;

    const report = new Report({
      _id: reportId,
      fileName: fileName || "medical_report.pdf",
      fullText,
      collectionId,
      chunkCount: 0,
      processingStatus: 'processing'
    });

    await report.save();

    // Add report ID to member's reports array
    await Member.findByIdAndUpdate(
      memberId,
      { $push: { reports: reportId } }
    );

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

// ==========================================
// SMART RATE LIMITING - SILENT & EFFICIENT
// ==========================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Global queue to serialize all Groq calls
let groqCallQueue = Promise.resolve();
const MIN_CALL_INTERVAL = 3000; // 3 seconds between ANY calls
let lastCallTime = 0;

async function rateLimitedGroqCall(apiKey, payload) {
  // Add this call to the queue
  return groqCallQueue = groqCallQueue.then(async () => {
    // Calculate wait time
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    const waitTime = Math.max(0, MIN_CALL_INTERVAL - timeSinceLastCall);
    
    if (waitTime > 0) {
      await delay(waitTime);
    }
    
    // Try the API call with retries
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        lastCallTime = Date.now();
        
        const response = await axios.post(
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
        
        return response;
      } catch (error) {
        if (error.response?.status === 429) {
          // Rate limited - wait longer
          const backoffTime = Math.min(5000 * Math.pow(2, attempt), 30000);
          await delay(backoffTime);
          continue;
        }
        throw error;
      }
    }
    
    throw new Error("Maximum retries exceeded");
  });
}

export const queryReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { query, topK = 5 } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
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
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Service is busy. Please try again in a moment.",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Add this function to your reportController.js
// Place it RIGHT AFTER your existing queryReport function

// ==========================================
// ⚡ STREAMING QUERY WITH GROQ
// ==========================================

export const queryReportStream = async (req, res) => {
  const { reportId } = req.params;
  const { query, topK = 5 } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Validation
    if (!query || !query.trim()) {
      res.write(`data: ${JSON.stringify({ error: "Query is required" })}\n\n`);
      return res.end();
    }

    // 1. Get report
    const report = await Report.findById(reportId);
    if (!report) {
      res.write(`data: ${JSON.stringify({ error: "Report not found" })}\n\n`);
      return res.end();
    }

    // 2. Get embedding and search ChromaDB
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

    // 3. Streaming prompt
    const prompt = `Based on the following medical report excerpts, answer this question: "${query}"

Medical Report Context:
${context}

Provide a clear, accurate answer based only on the information given. If the information is not in the context, say so.`;

    // 4. ⚡ STREAM with Groq API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile", // Faster model for streaming
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
        stream: true, // ⚡ Enable streaming
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: 'stream', // Important for axios streaming
        timeout: 30000,
      }
    );

    // 5. Parse and forward stream to frontend
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // Remove 'data: ' prefix
          
          if (data === '[DONE]') {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content;
            
            if (token) {
              res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    });

    response.data.on('end', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error("Streaming query error:", error);
    
    if (error.response?.status === 429) {
      res.write(`data: ${JSON.stringify({ error: "Service is busy. Please try again in a moment." })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    }
    res.end();
  }
};

export const summarizeReport = async (req, res) => {
  try {
    // 🔹 1. Detect user language from frontend
    const lang =
      req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || "en";

    const languageInstructions = {
  en: "Respond in English.",
  hi: "हिन्दी में उत्तर दें।",
  mr: "मराठीत उत्तर द्या."
};

const languageInstruction =
  languageInstructions[lang] || languageInstructions.en;

    const { reportId } = req.params;
    const apiKey = process.env.GROQ_API_KEY;

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
        error: "Report not found"
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
      nResults: 10
    });

    const context = results.documents[0].join("\n\n");

    // 🔹 2. LANGUAGE-INJECTED PROMPT (THIS IS THE KEY FIX)
    const prompt = `
${languageInstruction}

Analyze the following medical report and provide a structured, patient-friendly summary.

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

Medical Report Content:
${context}

Formatting rules:
- Use clear bullet points
- If any information is missing, write "Not mentioned"
- Do not add information that is not present in the report
`;

    const response = await rateLimitedGroqCall(apiKey, {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 800
    });

    const summary = response.data.choices[0].message.content;

    if (!report.summaries) {
  report.summaries = {};
}

// Store summary per language
report.summaries[lang] = summary;

await report.save();

res.json({
  success: true,
  summary: report.summaries[lang],
});

  } catch (error) {
    console.error("Summarize error:", error);

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Service is busy. Please try again in a moment."
      });
    }

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

export const healthCheck = async (req, res) => {
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