import mongoose from "mongoose";
import httpStatus from "http-status";
import { Notes } from "../../database/schema/notes/schema.js";
import type { INotes } from "../../database/schema/notes/interface.js";
import type { authPayload } from "../../database/schema/user/interface.js";
import apiError from "../../utils/apiError.js";
import { buildPagination } from "../../utils/pagination.js";

export const getSafeNoteData = (note: INotes | any) => {
  return {
    _id: note._id,
    title: note.title,
    content: note.content,
    author: note.author,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
};

export class NoteService {
  public static async createNote(
    userId: string,
    data: { title: string; content: string },
  ) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const note = await Notes.create({
      title: data.title.trim(),
      content: data.content.trim(),
      author: new mongoose.Types.ObjectId(userId),
    });

    return getSafeNoteData(note);
  }

  public static async getNotes(
    currentUser: authPayload,
    pagination: { page: number; limit: number },
    queryFilter?: { author?: string },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { isDeleted: false };

    if (currentUser.role === "admin") {
      // Admin can filter by author if provided, or list everyone's notes
      if (queryFilter?.author) {
        if (!mongoose.Types.ObjectId.isValid(queryFilter.author)) {
          throw apiError(httpStatus.BAD_REQUEST, "Invalid author ID format");
        }
        filter.author = new mongoose.Types.ObjectId(queryFilter.author);
      }
    } else {
      // Regular users are strictly scoped to their own notes (cannot bypass via query params)
      filter.author = new mongoose.Types.ObjectId(currentUser.id);
    }

    const [totalData, notes] = await Promise.all([
      Notes.countDocuments(filter),
      Notes.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const paginationMeta = buildPagination({ totalData, page, limit });

    return {
      notes: notes.map(getSafeNoteData),
      pagination: paginationMeta,
    };
  }

  // Alias for backwards compatibility
  public static getMyNotes(
    userId: string,
    pagination: { page: number; limit: number },
  ) {
    return NoteService.getNotes(
      { id: userId, role: "user", email: "", name: "" },
      pagination,
    );
  }

  public static async getNoteById(currentUser: authPayload, noteId: string) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid note ID");
    }

    const filter: Record<string, any> = {
      _id: noteId,
      isDeleted: false,
    };

    if (currentUser.role !== "admin") {
      filter.author = new mongoose.Types.ObjectId(currentUser.id);
    }

    const note = await Notes.findOne(filter);

    if (!note) {
      throw apiError(httpStatus.NOT_FOUND, "Note not found");
    }

    return getSafeNoteData(note);
  }

  public static async updateNote(
    currentUser: authPayload,
    noteId: string,
    data: { title?: string; content?: string },
  ) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid note ID");
    }

    const allowedUpdates: { title?: string; content?: string } = {};

    if (data.title !== undefined) {
      allowedUpdates.title = data.title.trim();
    }
    if (data.content !== undefined) {
      allowedUpdates.content = data.content.trim();
    }

    if (Object.keys(allowedUpdates).length === 0) {
      throw apiError(
        httpStatus.BAD_REQUEST,
        "No valid fields provided for update",
      );
    }

    const filter: Record<string, any> = {
      _id: noteId,
      isDeleted: false,
    };

    if (currentUser.role !== "admin") {
      filter.author = new mongoose.Types.ObjectId(currentUser.id);
    }

    const updatedNote = await Notes.findOneAndUpdate(
      filter,
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    );

    if (!updatedNote) {
      throw apiError(httpStatus.NOT_FOUND, "Note not found");
    }

    return getSafeNoteData(updatedNote);
  }

  public static async deleteNote(currentUser: authPayload, noteId: string) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid note ID");
    }

    const filter: Record<string, any> = {
      _id: noteId,
      isDeleted: false,
    };

    if (currentUser.role !== "admin") {
      filter.author = new mongoose.Types.ObjectId(currentUser.id);
    }

    const deletedNote = await Notes.findOneAndUpdate(
      filter,
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!deletedNote) {
      throw apiError(httpStatus.NOT_FOUND, "Note not found");
    }

    return null;
  }
}
