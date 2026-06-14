import type { Request, Response, NextFunction } from "express";
import * as userRepository from "@/modules/users/user.repository";
import type { UserStatus } from "@/modules/users/user.types";
import { StatusCodes } from "http-status-codes";

export function checkUserStatus(allowedStatuses: UserStatus[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.auth;
    if (!payload) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }
    let reason = "Unknown";
    if (allowedStatuses.includes(user.status)) {
      next();
    } else {
      if (user.status === "unverified") {
        reason = "Unverified";
      } else if (user.status === "blocked") {
        reason = "Blocked";
      }
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden", reason });
    }
  };
}
