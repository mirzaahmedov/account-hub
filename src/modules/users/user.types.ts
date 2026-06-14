import type { Knex } from "knex";

export type UserStatus = "unverified" | "blocked" | "active";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  status: UserStatus;
  verification_token: string | null;
  verification_expires_at: string | null;
  is_email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PublicUser = Omit<User, "password">;

export interface NewUser {
  name: string;
  email: string;
  password: string;
  verification_token: string;
  verification_expires_at: string;
  status?: UserStatus;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
  status?: UserStatus;
  is_email_verified?: boolean;
  verification_token?: string | null;
  verification_expires_at?: string | null;
  last_login_at?: string | null;
}

declare module "knex/types/tables" {
  interface Tables {
    users: Knex.CompositeTableType<User, Omit<NewUser, "created_at" | "updated_at">, Partial<Omit<User, "id">>>;
  }
}
