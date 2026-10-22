import type { authPayload } from "../database/schema/user/interface.js";

declare global {
  namespace Express {
    interface Request {
      user?: authPayload;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: authPayload;
  }
}

declare module "express" {
  interface Request {
    user?: authPayload;
  }
}

export {};
