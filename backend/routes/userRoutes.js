import express from "express";
import { signin, signup, getUserInfo } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/", getUserInfo)

// Debug route (OK)
router.get("/debug/all", async (req, res) => {
  const users = await User.find().select("_id name email phone familyMembers");
  res.json({ success: true, count: users.length, users });
});

// Authenticated user route (THIS is the one frontend should use)
router.get("/me", protect, getUserInfo);

export default router;
