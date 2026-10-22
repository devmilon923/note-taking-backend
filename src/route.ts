import { Router } from "express";

const router = Router();
export const appRouters = [];

appRouters.forEach(({ path, handler }) => {
  router.use(path, handler);
});
export default router;
