// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  summary: {
    type: String,
    default: ''
  },
  keyFindings: {
    type: String,
    default: ''
  },
  recommendations: {
    type: String,
    default: ''
  },
  fullText: {
    type: String,
    required: true
  },
  chunkCount: {
    type: Number,
    default: 0
  },
  collectionId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
reportSchema.index({ patient: 1, uploadDate: -1 });
reportSchema.index({ collectionId: 1 });

const Report = mongoose.model("Report", reportSchema);
export default Report;