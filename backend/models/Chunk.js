// models/Chunk.js
import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
  report: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Report', 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  index: {
    type: Number,
    required: true
  },
  startWord: {
    type: Number,
    required: true
  },
  endWord: {
    type: Number,
    required: true
  },
  metadata: {
    section: {
      type: String,
      enum: ['patient_info', 'diagnosis', 'medications', 'test_results', 'vital_signs', 'recommendations', 'general'],
      default: 'general'
    },
    page: Number
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Add indexes
chunkSchema.index({ report: 1, index: 1 });
chunkSchema.index({ 'metadata.section': 1 });

const Chunk = mongoose.model("Chunk", chunkSchema);
export default Chunk;