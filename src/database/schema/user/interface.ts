import type { JwtPayload } from "jsonwebtoken";
export const roleArray = ["admin", "user"] as const;
export type IRole = (typeof roleArray)[number];
export type authPayload = {
  id: number;
  name: string;
  email: string;
  role: IRole;
} & JwtPayload;

export type IUser = Document & {
  name: string;
  email: string;
  password: string;
  role: IRole;
  isDeleted: boolean;
};
