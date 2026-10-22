import type { Request, Response, CookieOptions } from "express";
import httpStatus from "http-status";
import { AuthService } from "./service.js";
import { SendSuccess } from "../../../utils/response.js";
import envManager from "../../../resource/env.js";

const env = envManager();
const isProduction = env.NODE_ENV === "production";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearAuthCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export class AuthHandler {
  public static async register(req: Request, res: Response) {
    const result = await AuthService.register(req.body);
    return SendSuccess(res, httpStatus.CREATED, {
      message: "User registered successfully",
      data: result,
    });
  }

  public static async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    res.cookie("accessToken", result.token, authCookieOptions);
    return SendSuccess(res, httpStatus.OK, {
      message: "User logged in successfully",
      data: {
        ...result.user,
        token: result.token,
      },
    });
  }

  public static async logout(req: Request, res: Response) {
    res.clearCookie("accessToken", clearAuthCookieOptions);
    return SendSuccess(res, httpStatus.OK, {
      message: "User logged out successfully",
      data: null,
    });
  }
}
