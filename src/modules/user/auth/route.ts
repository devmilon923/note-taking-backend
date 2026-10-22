import { Router } from "express";
import { authValidation } from "./validation.js";
import { zodValidator } from "../../../middleware/zodValidator.js";
import { AuthHandler } from "./handler.js";

const router = Router();

router
  .route("/register")
  .post(zodValidator(authValidation.signupValidation), AuthHandler.register);

router
  .route("/login")
  .post(zodValidator(authValidation.loginValidation), AuthHandler.login);

const AuthRoutes = router;
export default AuthRoutes;
