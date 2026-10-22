import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { SendError } from "../utils/response.js";
import httpStatus from "http-status";
export function zodValidator(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.format();
      const { _errors, ...fieldErrors } = formattedErrors;
      res.statusCode = httpStatus.BAD_REQUEST;
      return SendError(res, httpStatus.BAD_REQUEST, {
        message: "Zod validation error",
        data: fieldErrors,
      });
    }
    next();
  };
}
