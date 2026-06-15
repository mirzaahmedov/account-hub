import z from "zod";

export const UserCreateSchema = z.object({
  name: z.string().nonempty(),
  email: z.email(),
  password: z.string().nonempty(),
});

export const UserLoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  password: z.string().optional(),
  status: z.enum(["unverified", "blocked", "active"]).optional(),
});
