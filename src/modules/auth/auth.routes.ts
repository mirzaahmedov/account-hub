import express from "express";

import { registerUser, loginUser, getMe } from "./auth.controller.js";
import { authMiddleware } from "@/middleware/auth.js";
import { checkUserStatus } from "@/middleware/checkUserStatus.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, checkUserStatus(["active", "unverified"]), getMe);

export default router;
