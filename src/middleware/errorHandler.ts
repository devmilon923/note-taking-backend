import type {
  ErrorRequestHandler,
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

    const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const response = CommonErrorHandler(err);
    return SendError(res, statusCode, response);
  }
  next();
}
