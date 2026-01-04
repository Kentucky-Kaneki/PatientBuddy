// routes/reportRoutes.js
import express from 'express';

const router = express.Router();
import { 
  uploadReport, 
  queryReport, 
  queryReportStream,  // ⚡ NEW - Add this import
  summarizeReport, 
  getReport, 
  deleteReport, 
  getPatientReports,
  healthCheck
} from '../controllers/reportController.js';

// Import your auth middleware if you have one
// const { protect } = require('../middleware/authMiddleware');

// Report routes
router.post('/upload', uploadReport);

// ⚡ IMPORTANT: Streaming route MUST come before the regular query route
router.post('/:reportId/query/stream', queryReportStream);  // ⚡ NEW - More specific route first
router.post('/:reportId/query', queryReport);               // General route second

router.post('/:reportId/summarize', summarizeReport);
router.get('/:reportId', getReport);
router.delete('/:reportId', deleteReport);

// router.get('/patients/:patientId/reports', getPatientReports);
// router.get('/health', healthCheck);

export default router;