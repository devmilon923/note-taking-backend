import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { ZodError } from "zod";

import httpStatus from "http-status";
import { SendError } from "../utils/response.js";
import { CommonErrorHandler, ZodErrorHandler } from "../utils/error.js";
export default function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err) {
    if (err instanceof ZodError) {
      const response = ZodErrorHandler(err);
      return SendError(res, httpStatus.BAD_REQUEST, response);
    }

    if (err.code === 11000) {
      return SendError(res, httpStatus.CONFLICT, {
        message: "Email is already registered",
        data: null,
      });
    }

    if (err.name === "CastError") {
      return SendError(res, httpStatus.BAD_REQUEST, {
        message: `Invalid ${err.path || "ID"} format`,
        data: null,
      });
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return SendError(res, httpStatus.UNAUTHORIZED, {
        message: "Invalid or expired token",
        data: null,
      });
    }

    const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const response = CommonErrorHandler(err);
    return SendError(res, statusCode, response);
  }
  next();
}
