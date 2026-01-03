// routes/reportRoutes.js
import express from 'express';

const router = express.Router();
import { healthCheck, uploadReport, queryReport, summarizeReport, getReport, deleteReport, getPatientReports } from '../controllers/reportController.js';

// Import your auth middleware if you have one
// const { protect } = require('../middleware/authMiddleware');

// Health check route
router.get('/health', healthCheck);

// Report routes
router.post('/reports/upload', uploadReport);
router.post('/reports/:reportId/query', queryReport);
router.post('/reports/:reportId/summarize', summarizeReport);
router.get('/reports/:reportId', getReport);
router.delete('/reports/:reportId', deleteReport);

// Patient reports route
router.get('/patients/:patientId/reports', getPatientReports);

export default router;