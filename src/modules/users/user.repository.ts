import { db } from "@/db/index.js";
import type { NewUser, User, UserUpdate } from "./user.types.js";

export async function create(data: NewUser): Promise<User> {
  const [user] = await db("users").insert(data).returning("*");
  return user!;
}

export function findById(id: number): Promise<User | undefined> {
  return db("users").where({ id }).first();
}

export function findByEmail(email: string): Promise<User | undefined> {
  return db("users").where({ email }).first();
}

export function findByVerificationToken(token: string): Promise<User | undefined> {
  return db("users").where({ verification_token: token }).first();
}

export function findAll({ search, sortKey, sortOrder }: { search: string; sortKey: string; sortOrder: string }): Promise<User[]> {
  return db("users").where("name", "like", `%${search}%`).orWhere("email", "like", `%${search}%`).orderBy(sortKey, sortOrder);
}

export function update(id: number, data: UserUpdate): Promise<User | undefined> {
  return db("users")
    .where({ id })
    .update(data)
    .returning("*")
    .then((rows) => rows[0]);
}

export function updateBatch(ids: number[], data: UserUpdate): Promise<number> {
  return db("users").whereIn("id", ids).update(data);
}

export function remove(id: number): Promise<number> {
  return db("users").where({ id }).del();
}

export function removeBatch(ids: number[], onlyUnverified = false): Promise<number[]> {
  if (onlyUnverified) {
    return db("users").whereIn("id", ids).andWhere("status", "unverified").del();
  } else {
    return db("users").whereIn("id", ids).del();
  }
}
