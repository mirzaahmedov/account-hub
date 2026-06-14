import { JWTService } from "@/services/JWTService";
import type { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  const payload = token ? JWTService.verifyToken(token) : undefined;

  if (!token || !payload) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.auth = payload;

  next();
}
