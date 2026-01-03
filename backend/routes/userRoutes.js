import express from "express";
import { signin, signup, getUserInfo } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", getUserInfo)
router.post("/signup", signup);
router.post("/signin", signin);

export default router;
