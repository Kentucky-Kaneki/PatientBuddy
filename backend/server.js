import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import insightsRoutes from "./routes/insightsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use('/api/reports', reportRoutes);
app.use('/api/patient', userRoutes);
app.use('/api/insights', insightsRoutes);
app.use("/api", chatRoutes);
app.use("/api/history", historyRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Medical RAG System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      uploadReport: 'POST /api/reports/upload',
      queryReport: 'POST /api/reports/:reportId/query',
      summarizeReport: 'POST /api/reports/:reportId/summarize',
      getReport: 'GET /api/reports/:reportId',
      deleteReport: 'DELETE /api/reports/:reportId',
      patientReports: 'GET /api/patients/:patientId/reports'
    }
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


const PORT = 5050;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║       🏥 Medical RAG System Backend                   ║
║                                                       ║
║  🚀 Server running on port ${PORT}                     ║
║  📊 MongoDB: Connected ✅                              ║
║  🔍 ChromaDB: ${process.env.CHROMA_URL || 'http://localhost:8000'}         ║
║                                                       ║
║  📍 API Base: http://localhost:${PORT}/api             ║
║  ❤️  Health Check: http://localhost:${PORT}/api/health ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};

startServer();


// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});