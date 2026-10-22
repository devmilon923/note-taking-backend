import { Router } from "express";
import AuthRoutes from "./modules/user/auth/route.js";

const router = Router();
export const appRouters = [{ path: "/auth", handler: AuthRoutes }];

appRouters.forEach(({ path, handler }) => {
  router.use(path, handler);
});
export default router;
