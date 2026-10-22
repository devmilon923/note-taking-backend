import type { Document, Types } from "mongoose";
import type { JwtPayload } from "jsonwebtoken";

export const roleArray = ["admin", "user"] as const;
export type IRole = (typeof roleArray)[number];

export type authPayload = {
  id: string;
  name: string;
  email: string;
  role: IRole;
} & JwtPayload;

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: IRole;
  isDeleted: boolean;
  interests?: Array<"chess" | "coding" | "music" | "travel">;
  createdAt?: Date;
  updatedAt?: Date;
}
