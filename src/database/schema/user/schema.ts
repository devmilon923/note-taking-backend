import { model, models, Schema } from "mongoose";
import type { IUser } from "./interface.js";
import { roleArray } from "./interface.js";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: roleArray,
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    interests: {
      type: String,
      enum: ["chess", "coding", "swimming", "reading"],
    },
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>("User", userSchema);
