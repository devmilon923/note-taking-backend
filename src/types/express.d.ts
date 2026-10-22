import type { authPayload } from "../database/schema/user/validation.js";

declare global {
  namespace Express {
    interface Request {
      user?: authPayload;
    }
  }
}

export {};
