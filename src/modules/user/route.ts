import { Router } from "express";
import authCheck from "../../middleware/authCheck.js";
import { zodValidator } from "../../middleware/zodValidator.js";
import { UserHandler } from "./handler.js";
import { userValidation } from "./validation.js";

const router = Router();

// Profile endpoints (all authenticated users)
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

// Aggregation Scenario 1: Group users by interests (all authenticated users)
router
  .route("/interests")
  .get(authCheck(["admin"]), UserHandler.getUsersByInterests);

// Aggregation Scenario 2: Retrieve a user's notes using $lookup (permission-enforced: user can view own, admin can view any)
router
  .route("/notes/:id")
  .get(authCheck(["admin"]), UserHandler.getUserNotesWithLookup);

// Admin user management: Filter and search users
router
  .route("/filter")
  .get(authCheck(["admin"]), UserHandler.adminGetUsers);

// Admin user management: List all users & Create new user
router
  .route("/")
  .get(authCheck(["admin"]), UserHandler.adminGetUsers)
  .post(
    authCheck(["admin"]),
    zodValidator(userValidation.adminCreateUserValidation),
    UserHandler.adminCreateUser,
  );

// Admin user management: Get, Update, and Delete individual user
router
  .route("/:id")
  .get(authCheck(["admin"]), UserHandler.adminGetUserById)
  .patch(
    authCheck(["admin"]),
    zodValidator(userValidation.adminUpdateUserValidation),
    UserHandler.adminUpdateUser,
  )
  .put(
    authCheck(["admin"]),
    zodValidator(userValidation.adminUpdateUserValidation),
    UserHandler.adminUpdateUser,
  )
  .delete(authCheck(["admin"]), UserHandler.adminDeleteUser);

export const UserRoute = router;
