import express from "express";
import { signin, signup, getUserInfo, addFamilyMember, getUserHistory, getHealthInsights } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUserInfo)
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/:userId/addmember", addFamilyMember);
router.get("/history", getUserHistory);
router.get("/insights/:userId", getHealthInsights);

export default router;
