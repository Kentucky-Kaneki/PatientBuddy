import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription" }]
}, { timestamps: true });

const Member = mongoose.model("Member", memberSchema);
export default Member;