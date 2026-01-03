import express from "express";
import { signin, signup, getUserInfo, addFamilyMember } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUserInfo)
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/:userId/addmember", addFamilyMember);

export default router;
