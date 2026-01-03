import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";

dotenv.config();
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// API Routes
app.use("/user", userRoutes);
app.use("/reports", reportRoutes);
app.use("/prescriptions", prescriptionRoutes);


app.listen(5000, () => console.log("🚀 Server running on port 5000"));
