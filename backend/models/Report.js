import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  summary: { type: String, required: true }, // Stores text that will act as vectorDB input
  keyFindings: { type: String },
  recommendations: { type: String },
  createdAt: { type: Date, default: Date.now }  
});

const Report = mongoose.model("Report", reportSchema);
export default Report;