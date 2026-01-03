import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  phone: { type: Number, required: false, unique: true },
  password: { type: String, required: true },
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription" }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
