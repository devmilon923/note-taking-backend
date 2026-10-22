import { Router } from "express";
import authCheck from "../../middleware/authCheck.js";
import { zodValidator } from "../../middleware/zodValidator.js";
import { UserHandler } from "./handler.js";
import { userValidation } from "./validation.js";

const router = Router();

router
  .route("/profile")
  .get(authCheck(["all"]), UserHandler.getProfile)
  .patch(
    authCheck(["all"]),
    zodValidator(userValidation.updateProfileValidation),
    UserHandler.updateProfile,
  )
  .put(
    authCheck(["all"]),
    zodValidator(userValidation.updateProfileValidation),
    UserHandler.updateProfile,
  );

export const UserRoute = router;
