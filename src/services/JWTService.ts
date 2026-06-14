import jwt from "jsonwebtoken";

export interface JWTPayload {
  userId: number;
}

export class JWTService {
  static createToken(payload: JWTPayload) {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "3d",
    });
  }

  static verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  }
}
