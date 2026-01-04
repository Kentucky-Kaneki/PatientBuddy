import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  symptoms: { type: String, default: "" },
  findings: { type: String, default: "" },
  medications: [
    {
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }
  ],
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
