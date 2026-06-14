import type { User } from "./user.types";

type SafeUser = Omit<User, "password" | "verification_token" | "verification_expires_at">;

export function sanitizeUser(user: User): SafeUser {
  const { password: _, verification_token: __, verification_expires_at: ___, ...safeUser } = user;

  return safeUser;
}
