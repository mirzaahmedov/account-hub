import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import * as userRepository from "@/modules/users/user.repository.js";
import { UserUpdateSchema } from "@/modules/users/user.schema.js";
import { EmailService } from "@/services/EmailService.js";
import { BatchActionBodySchema } from "@/modules/common/common.schema.js";
import z from "zod";
import { sanitizeUser } from "./user.helpers.js";
import knex from "knex";
import { db } from "@/db/index.js";

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const search = String(req.query.search || "");
    const sortKey = String(req.query.sort_key || "created_at");
    const sortOrder = String(req.query.sort_order || "desc");

    const users = await userRepository.findAll({
      search,
      sortKey,
      sortOrder,
    });
    const safeUsers = users.map(sanitizeUser);
    res.json(safeUsers);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid id" });
      return;
    }

    const user = await userRepository.findById(id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    const safeUser = sanitizeUser(user);
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid id" });
      return;
    }

    const result = UserUpdateSchema.safeParse(req.body);
    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json(result.error);
      return;
    }

    const user = await userRepository.findById(id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    const updated = await userRepository.update(id, result.data as import("./user.types.js").UserUpdate);
    if (!updated) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to update user" });
      return;
    }

    const safeUser = sanitizeUser(updated);
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
}

export async function updateBatchUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const BatchActionWithStatusBodySchema = BatchActionBodySchema.extend({
      status: z.enum(["active", "blocked"]),
    });

    const result = BatchActionWithStatusBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json(result.error);
      return;
    }

    const { ids, status } = result.data;
    const updateCount = await userRepository.updateBatch(ids, {
      status:
        status === "active"
          ? (db.raw(`
            CASE
              WHEN is_email_verified = 1 THEN 'active'
              ELSE 'unverified'
            END
          `) as any)
          : status,
    });

    res.status(StatusCodes.OK).json({
      updateCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendVerificationEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;

    const user = await userRepository.findById(userId);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
      return;
    }

    if (user.is_email_verified) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "User already verified",
      });
      return;
    }

    const verificationToken = crypto.randomUUID();
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 10);

    await userRepository.update(userId, {
      verification_token: verificationToken,
      verification_expires_at: verificationExpiresAt.toISOString(),
    });

    await EmailService.sendVerificationEmail(user.email, verificationToken);

    res.status(StatusCodes.OK).json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.query.token as string | undefined;
    if (!token) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Token is required" });
      return;
    }

    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Invalid or expired token" });
      return;
    }

    if (user.status === "blocked") {
      res.status(StatusCodes.FORBIDDEN).json({ message: "User is blocked" });
    }

    if (user.verification_expires_at && new Date(user.verification_expires_at) < new Date()) {
      res.status(StatusCodes.GONE).json({ message: "Verification token has expired" });
      return;
    }

    if (user.status === "active") {
      res.status(StatusCodes.OK).json({ message: "Email already verified" });
      return;
    }

    await userRepository.update(user.id, {
      status: "active",
      is_email_verified: true,
      verification_token: null,
      verification_expires_at: null,
    });

    res.redirect(process.env.APP_URL + "/email-verified");
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid id" });
      return;
    }

    const user = await userRepository.findById(id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    await userRepository.remove(id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}

export async function deleteBatchUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = BatchActionBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid id" });
      return;
    }

    const deleteCount = await userRepository.removeBatch(result.data.ids);
    res.status(StatusCodes.OK).send({
      deleteCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBatchUsersUnverified(req: Request, res: Response, next: NextFunction) {
  try {
    const result = BatchActionBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid id" });
      return;
    }

    const deleteCount = await userRepository.removeBatch(result.data.ids, true);
    res.status(StatusCodes.OK).send({
      deleteCount,
    });
  } catch (error) {
    next(error);
  }
}
