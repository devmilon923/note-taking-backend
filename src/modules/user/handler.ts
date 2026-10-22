import type { Request, Response } from "express";
import httpStatus from "http-status";
import { UserService } from "./service.js";
import { SendError, SendSuccess } from "../../utils/response.js";
import apiError from "../../utils/apiError.js";
import { userValidation } from "./validation.js";

export class UserHandler {
  public static async getProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw apiError(httpStatus.UNAUTHORIZED, "Authentication token required");
    }

    const profile = await UserService.getProfile(userId);
    return SendSuccess(res, httpStatus.OK, {
      message: "Profile retrieved successfully",
      data: profile,
    });
  }

  public static async updateProfile(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw apiError(httpStatus.UNAUTHORIZED, "Authentication token required");
    }

    const updatedProfile = await UserService.updateProfile(userId, req.body);
    return SendSuccess(res, httpStatus.OK, {
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  }

  // Alias for backwards compatibility with any existing reference
  public static profile = UserHandler.getProfile;

  /**
   * MongoDB Aggregation Scenario 1: Group users by interests
   */
  public static async getUsersByInterests(req: Request, res: Response) {
    const result = await UserService.getUsersGroupedByInterests();
    return SendSuccess(res, httpStatus.OK, {
      message: "Users grouped by interests retrieved successfully",
      data: result,
    });
  }

  /**
   * MongoDB Aggregation Scenario 2: Retrieve a user's notes using $lookup
   */
  public static async getUserNotesWithLookup(req: Request, res: Response) {
    const currentUser = req.user;
    if (!currentUser) {
      throw apiError(httpStatus.UNAUTHORIZED, "Authentication token required");
    }

    const queryResult = userValidation.paginationValidation.safeParse(req.query);
    if (!queryResult.success) {
      const formattedErrors = queryResult.error.format();
      const { _errors, ...fieldErrors } = formattedErrors;
      return SendError(res, httpStatus.BAD_REQUEST, {
        message: "Invalid pagination parameters",
        data: fieldErrors,
      });
    }

    const targetUserId = req.params.id as string;
    const { page, limit } = queryResult.data;

    const result = await UserService.getUserNotesWithLookup(
      currentUser,
      targetUserId,
      { page, limit },
    );

    return SendSuccess(res, httpStatus.OK, {
      message: "User notes retrieved successfully via lookup",
      data: {
        user: result.user,
        notes: result.notes,
      },
      pagination: result.pagination,
    });
  }

  // ================= ADMIN USER MANAGEMENT =================

  public static async adminCreateUser(req: Request, res: Response) {
    const result = await UserService.adminCreateUser(req.body);
    return SendSuccess(res, httpStatus.CREATED, {
      message: "User created successfully",
      data: result,
    });
  }

  public static async adminGetUsers(req: Request, res: Response) {
    const queryResult = userValidation.paginationValidation.safeParse(req.query);
    if (!queryResult.success) {
      const formattedErrors = queryResult.error.format();
      const { _errors, ...fieldErrors } = formattedErrors;
      return SendError(res, httpStatus.BAD_REQUEST, {
        message: "Invalid pagination parameters",
        data: fieldErrors,
      });
    }

    const { page, limit } = queryResult.data;
    const result = await UserService.adminGetUsers({ page, limit });

    return SendSuccess(res, httpStatus.OK, {
      message: "Users retrieved successfully",
      data: result.users,
      pagination: result.pagination,
    });
  }

  public static async adminGetUserById(req: Request, res: Response) {
    const userId = req.params.id as string;
    const result = await UserService.adminGetUserById(userId);

    return SendSuccess(res, httpStatus.OK, {
      message: "User retrieved successfully",
      data: result,
    });
  }

  public static async adminUpdateUser(req: Request, res: Response) {
    const userId = req.params.id as string;
    const result = await UserService.adminUpdateUser(userId, req.body);

    return SendSuccess(res, httpStatus.OK, {
      message: "User updated successfully",
      data: result,
    });
  }

  public static async adminDeleteUser(req: Request, res: Response) {
    const userId = req.params.id as string;
    await UserService.adminDeleteUser(userId);

    return SendSuccess(res, httpStatus.OK, {
      message: "User deleted successfully",
      data: null,
    });
  }
}
