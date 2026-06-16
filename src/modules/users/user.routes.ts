import express from "express";

import * as userController from "./user.controller.js";
import { authMiddleware } from "@/middleware/auth.js";
import { guardUserBlocked } from "@/middleware/checkUserStatus.js";

const router = express.Router();

router.get("/", authMiddleware, guardUserBlocked, userController.getUsers);
router.post("/send-verification-email", authMiddleware, guardUserBlocked, userController.sendVerificationEmail);
router.get("/verify-email", userController.verifyEmail);
router.get("/:id", authMiddleware, guardUserBlocked, userController.getUser);

router.patch("/:id", authMiddleware, guardUserBlocked, userController.updateUser);
router.put("/update-batch/status", authMiddleware, guardUserBlocked, userController.updateBatchUserStatus);

router.delete("/delete-batch", authMiddleware, guardUserBlocked, userController.deleteBatchUsers);
router.delete("/delete-batch/unverified", authMiddleware, guardUserBlocked, userController.deleteBatchUsersUnverified);

router.delete("/:id", authMiddleware, guardUserBlocked, userController.deleteUser);

export default router;
