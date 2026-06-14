import type { JWTPayload } from "./services/JWTService";

declare module "express" {
  interface Request {
    auth?: JWTPayload;
  }
}
