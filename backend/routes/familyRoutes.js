import express from "express";
import { 
  getFamilyMembers, 
  addFamilyMember, 
  setActiveMember, 
  deleteFamilyMember,
  initializeFamilyMembers
} from "../controllers/familyController.js";

const router = express.Router();

router.get("/:userId/family", getFamilyMembers);
router.post("/:userId/family", addFamilyMember);
router.post("/:userId/family/initialize", initializeFamilyMembers);
router.put("/:userId/family/:memberId/activate", setActiveMember);
router.delete("/:userId/family/:memberId", deleteFamilyMember);

export default router;