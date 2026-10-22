import type { authPayload } from "../database/schema/user/interface.js";

declare global {
  namespace Express {
    interface Request {
      user?: authPayload;
    }
  }
}

export {};
