import mongoose, { model, models, Schema } from "mongoose";
import type { INotes } from "./interface.js";

const noteSchema = new Schema<INotes>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minLength: [3, "Title must be at least 3 characters long"],
      maxLength: [50, "Title must be at most 50 characters long"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minLength: [10, "Content must be at least 10 characters long"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
  },
  { timestamps: true },
);

// User-specific note pagination (newest first)
noteSchema.index({ author: 1, isDeleted: 1, createdAt: -1 });

// Admin cross-user note pagination (newest first)
noteSchema.index({ isDeleted: 1, createdAt: -1 });

// User-specific title prefix search
noteSchema.index({ author: 1, isDeleted: 1, title: 1 });

// Admin cross-user title prefix search
noteSchema.index({ isDeleted: 1, title: 1 });

export const Notes = models.Notes || model<INotes>("Notes", noteSchema);
