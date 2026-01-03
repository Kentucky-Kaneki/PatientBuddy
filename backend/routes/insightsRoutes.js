import express from "express";
import { getHealthInsights } from "../controllers/insightsController.js";

const router = express.Router();

router.get("/:userId/insights", getHealthInsights);

export default router;