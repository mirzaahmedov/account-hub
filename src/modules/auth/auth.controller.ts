import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { UserCreateSchema, UserLoginSchema } from "@/modules/users/user.schema.js";
import * as userRepository from "@/modules/users/user.repository.js";
import { EmailService } from "@/services/EmailService";
import { sanitizeUser } from "../users/user.helpers";
import { JWTService } from "@/services/JWTService";

export async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = UserCreateSchema.safeParse(req.body);
    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json(result.error);
      return;
    }

    const existing = await userRepository.findByEmail(result.data.email);
    if (existing) {
      res.status(StatusCodes.CONFLICT).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 10);
    const verificationToken = crypto.randomUUID();
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 10);

    const user = await userRepository.create({
      name: result.data.name,
      email: result.data.email,
      password: hashedPassword,
      verification_token: verificationToken,
      verification_expires_at: verificationExpiresAt.toISOString(),
    });

    const safeUser = sanitizeUser(user);
    const accessToken = JWTService.createToken({
      userId: user.id,
    });

    res.status(StatusCodes.CREATED).json({
      user: safeUser,
      access_token: accessToken,
    });

    await EmailService.sendVerificationEmail(user.email, verificationToken).catch(() => {});
  } catch (error) {
    next(error);
  }
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = UserLoginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json(result.error);
      return;
    }

    const user = await userRepository.findByEmail(result.data.email);
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid email or password" });
      return;
    }

    const passwordValid = await bcrypt.compare(result.data.password, user.password);
    if (!passwordValid) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid email or password" });
      return;
    }

    if (user.status === "blocked") {
      res.status(StatusCodes.FORBIDDEN).json({
        type: "blocked_user",
        message: "This account has been blocked",
      });
      return;
    }

    await userRepository.update(user.id, {
      last_login_at: new Date().toISOString(),
    });

    const safeUser = sanitizeUser(user);
    const accessToken = JWTService.createToken({ userId: user.id });

    res.json({
      user: safeUser,
      access_token: accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }

    const user = await userRepository.findById(req.auth.userId);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    const safeUser = sanitizeUser(user);
    res.json({
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
}
