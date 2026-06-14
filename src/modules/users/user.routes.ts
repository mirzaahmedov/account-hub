import express from "express";

import * as userController from "./user.controller.js";
import { authMiddleware } from "@/middleware/auth.js";
import { checkUserStatus } from "@/middleware/checkUserStatus.js";

const router = express.Router();

router.get("/", authMiddleware, checkUserStatus(["active"]), userController.getUsers);
router.post("/send-verification-email", authMiddleware, checkUserStatus(["unverified"]), userController.sendVerificationEmail);
router.get("/verify-email", userController.verifyEmail);
router.get("/:id", authMiddleware, checkUserStatus(["active"]), userController.getUser);

router.patch("/:id", authMiddleware, checkUserStatus(["active"]), userController.updateUser);
router.put("/update-batch/status", authMiddleware, checkUserStatus(["active"]), userController.updateBatchUserStatus);

router.delete("/delete-batch", authMiddleware, checkUserStatus(["active"]), userController.deleteBatchUsers);
router.delete("/delete-batch/unverified", authMiddleware, checkUserStatus(["active"]), userController.deleteBatchUsersUnverified);

router.delete("/:id", authMiddleware, checkUserStatus(["active"]), userController.deleteUser);

export default router;
