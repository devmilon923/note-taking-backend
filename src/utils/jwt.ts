import type { authPayload } from "../database/schema/user/interface.js";
import envManager from "../resource/env.js";
import jwt from "jsonwebtoken";
import apiError from "./apiError.js";
import httpStatus from "http-status";
export default class JWTService {
  private static readonly jwtSecret = envManager().JWT;

  public static loginToken(data: authPayload): {
    access: string;
    refresh: string;
  } {
    const access = jwt.sign(data, this.jwtSecret, {
      expiresIn: "7d",
    });
    const refresh = jwt.sign(data, this.jwtSecret, {
      expiresIn: "7d",
    });
    return { access, refresh };
  }

  public static jwtPayload(token: string): authPayload {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as authPayload;
      return payload;
    } catch (error) {
      throw apiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
    }
  }
}
