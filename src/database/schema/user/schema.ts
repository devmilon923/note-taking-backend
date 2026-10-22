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
      type: [String],
      default: [],
      enum: ["chess", "coding", "music", "travel"],
    },
  },
  { timestamps: true },
);

// Explicit schema index declarations
userSchema.index({ isDeleted: 1, createdAt: -1 });
userSchema.index({ isDeleted: 1, role: 1 });
userSchema.index({ name: 1 });
userSchema.index({ interests: 1 });

export const User = models.User || model<IUser>("User", userSchema);
