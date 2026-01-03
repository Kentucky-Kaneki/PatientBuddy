import express from "express";
import { signin, signup, getUserInfo } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/", getUserInfo)

export default router;