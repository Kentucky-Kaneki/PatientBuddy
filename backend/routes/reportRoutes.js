// routes/reportRoutes.js
import express from 'express';

const router = express.Router();
import { healthCheck, uploadReport, queryReport, summarizeReport, getReport, deleteReport, getPatientReports } from '../controllers/reportController.js';

// Import your auth middleware if you have one
// const { protect } = require('../middleware/authMiddleware');

// Report routes
router.post('/upload', uploadReport);
router.post('/:reportId/query', queryReport);
router.post('/:reportId/summarize', summarizeReport);
router.get('/patients/:patientId/reports', getPatientReports);
router.get('/:reportId', getReport);
router.delete('/:reportId', deleteReport);

router.get('/recent/:patientId', getPatientReports);
// router.get('/health', healthCheck);

export default router;