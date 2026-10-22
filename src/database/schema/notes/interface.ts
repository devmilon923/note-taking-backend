import { Types } from "mongoose";

export type INotes = Document & {
  title: string;
  content: string;
  author: Types.ObjectId;
  isDeleted: boolean;
};
