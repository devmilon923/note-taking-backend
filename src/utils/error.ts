import type { ZodError } from "zod";

export function ZodErrorHandler(err: ZodError) {
  const formattedErrors = err.format();
  const { _errors, ...fieldErrors } = formattedErrors;

  return {
    message: "Zod input validation error",
    data: fieldErrors,
  };
}
export function DrizzleQueryErrorHandler(err: any) {
  let message = "Drizzle Query error";
//  console.log(err.cause);
  if (err.cause.code === "23505") {
    message = "Data already exists";
  } else if (err.cause.code === "42601") {
    message = "Invalid query";
  } else if (err.cause.code === "42P01") {
    message = "Table not found";
  } else if (err.cause.code === "42P07") {
    message = "Table already exists";
  } else if (err.cause.code === "23502") {
    message = "Not null constraint failed";
  } else if (err.cause.code === "23503") {
    message = "Data not found";
  } else if (err.cause.code === "45000") {
    message = err.message;
  }
  console.log(message);
  return {
    message: message,
    data: err,
  };
}
export function CommonErrorHandler(err: any) {
  return {
    message: err.message,
    data: err,
  };
}