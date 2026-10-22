/// <reference path="../types/express.d.ts" />
import type { NextFunction, Request, Response } from "express";
import type { IRole } from "../database/schema/user/interface.js";
import httpStatus from "http-status";
import apiError from "../utils/apiError.js";
import JWTService from "../utils/jwt.js";

export default function authCheck(roles: (IRole | "all")[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken || null;
    if (!token) {
      throw apiError(httpStatus.UNAUTHORIZED, "Authentication token required");
    }
    const payload = JWTService.jwtPayload(token);
    if (!payload) {
      throw apiError(httpStatus.UNAUTHORIZED, "Invalid authentication token");
    }

    if (!roles.includes(payload.role) && !roles.includes("all")) {
      throw apiError(
        httpStatus.FORBIDDEN,
        "Access forbidden: insufficient permissions",
      );
    }
    req.user = payload;
    next();
  };
}
