import express from "express";
import { chatWithReports } from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat", chatWithReports);

export default router;
