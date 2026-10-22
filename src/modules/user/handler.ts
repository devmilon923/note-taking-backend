import type { Request, Response } from "express";
import httpStatus from "http-status";
import { UserService } from "./service.js";
import { SendSuccess } from "../../utils/response.js";
import apiError from "../../utils/apiError.js";

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
}
