import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { User } from "../../../database/schema/user/schema.js";
import type { IUser } from "../../../database/schema/user/interface.js";
import apiError from "../../../utils/apiError.js";
import JWTService from "../../../utils/jwt.js";

export const getSafeUserData = (user: IUser | any) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    interests: user.interests,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export class AuthService {
  public static async register(payload: {
    name: string;
    email: string;
    password: string;
    interests?: Array<"chess" | "coding" | "music" | "travel">;
  }) {
    const normalizedEmail = payload.email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw apiError(httpStatus.CONFLICT, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await User.create({
      name: payload.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      interests: payload.interests || [],
      role: "user",
    });

    return getSafeUserData(user);
  }

  public static async login(payload: { email: string; password: string }) {
    const normalizedEmail = payload.email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      isDeleted: false,
    }).select("+password");

    if (!user) {
      throw apiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw apiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const tokenPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const tokens = JWTService.loginToken(tokenPayload);

    return {
      user: getSafeUserData(user),
      token: tokens.access,
    };
  }
}
