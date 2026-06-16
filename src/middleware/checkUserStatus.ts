import * as userRepository from "@/modules/users/user.repository";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function guardUserBlocked(req: Request, res: Response, next: NextFunction) {
  const payload = req.auth;
  if (!payload) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }

  const user = await userRepository.findById(payload.userId);
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }
  if (user.status === "blocked") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden", reason: "Blocked" });
  } else {
    next();
  }
}
