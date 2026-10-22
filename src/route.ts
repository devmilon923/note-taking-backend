import { Router } from "express";
import AuthRoutes from "./modules/user/auth/route.js";
import { UserRoute } from "./modules/user/route.js";
import NoteRoutes from "./modules/notes/route.js";

const router = Router();
export const appRouters = [
  { path: "/auth", handler: AuthRoutes },
  { path: "/user", handler: UserRoute },
  { path: "/note", handler: NoteRoutes },
];

appRouters.forEach(({ path, handler }) => {
  router.use(path, handler);
});
export default router;
