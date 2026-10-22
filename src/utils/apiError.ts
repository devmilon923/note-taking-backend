export interface ErrorDetails {
  path?: string | null;
  value?: any;
}

export interface ExtendedApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorDetails: ErrorDetails;
}

export const apiError = (
  statusCode: number,
  message: string,
): ExtendedApiError => {
  const error = new Error(message) as ExtendedApiError;
  // Remove stack trace completely
  error.statusCode = statusCode;
  Object.defineProperty(error, "stack", {
    value: undefined,
    writable: true,
    configurable: true,
  });

  return error;
};

export default apiError;
