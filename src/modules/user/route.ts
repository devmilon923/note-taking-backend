import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { UserHandler } from "./handler.js";

const router = Router();

router.route("/profile").get(authCheck(["all"]), UserHandler.profile);

export const UserRoute = router;
