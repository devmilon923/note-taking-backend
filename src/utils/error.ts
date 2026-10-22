import type { ZodError } from "zod";

export function ZodErrorHandler(err: ZodError) {
  const formattedErrors = err.format();
  const { _errors, ...fieldErrors } = formattedErrors;

  return {
    message: "Zod input validation error",
    data: fieldErrors,
  };
}

export function CommonErrorHandler(err: any) {
  return {
    message: err.message || "Internal server error",
    data: err.errorDetails || null,
  };
}
