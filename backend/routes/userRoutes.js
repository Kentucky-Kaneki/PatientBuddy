import express from "express";
import { signin, signup } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
// Patient reports route
// router.get('/patients/:patientId/reports', getPatientReports);
// Health check route
// router.get('/health', healthCheck);

export default router;