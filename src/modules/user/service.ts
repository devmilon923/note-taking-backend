import mongoose from "mongoose";
import httpStatus from "http-status";
import { User } from "../../database/schema/user/schema.js";
import apiError from "../../utils/apiError.js";
import { getSafeUserData } from "./auth/service.js";

export class UserService {
  public static async getProfile(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      throw apiError(httpStatus.NOT_FOUND, "User not found");
    }

    return getSafeUserData(user);
  }

  public static async updateProfile(
    userId: string,
    data: {
      name?: string;
      interests?: "chess" | "coding" | "swimming" | "reading";
    },
  ) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const allowedUpdates: {
      name?: string;
      interests?: "chess" | "coding" | "swimming" | "reading";
    } = {};

    if (data.name !== undefined) {
      allowedUpdates.name = data.name.trim();
    }
    if (data.interests !== undefined) {
      allowedUpdates.interests = data.interests;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      throw apiError(
        httpStatus.BAD_REQUEST,
        "No valid fields provided for update",
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw apiError(httpStatus.NOT_FOUND, "User not found");
    }

    return getSafeUserData(updatedUser);
  }
}
