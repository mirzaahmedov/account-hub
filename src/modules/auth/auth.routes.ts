import express from "express";

import { registerUser, loginUser, getMe } from "./auth.controller.js";
import { authMiddleware } from "@/middleware/auth.js";
import { guardUserBlocked } from "@/middleware/checkUserStatus.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, guardUserBlocked, getMe);

export default router;
