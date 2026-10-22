import type { Request, Response } from "express";
import httpStatus from "http-status";
import { NoteService } from "./service.js";
import { SendError, SendSuccess } from "../../utils/response.js";
import apiError from "../../utils/apiError.js";
import { noteValidation } from "./validation.js";

export class NoteHandler {
  public static async createNote(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw apiError(httpStatus.UNAUTHORIZED, "Authentication token required");
    }

    const note = await NoteService.createNote(userId, req.body);
    return SendSuccess(res, httpStatus.CREATED, {
      message: "Note created successfully",
      data: note,
    });
  }

  public static async getNotes(req: Request, res: Response) {
    const currentUser = req.user;
    if (!currentUser) {
      throw apiError(httpStatus.UNAUTHORIZED, "Authentication token required");
    }

    const queryResult =
      noteValidation.getNotesQueryValidation.safeParse(req.query);
    if (!queryResult.success) {
      const formattedErrors = queryResult.error.format();
      const { _errors, ...fieldErrors } = formattedErrors;
      return SendError(res, httpStatus.BAD_REQUEST, {
        message: "Invalid query parameters",
        data: fieldErrors,
      });
    }

    const { page, limit, author, title, searchQ, search } = queryResult.data;

    const result = await NoteService.getNotes(
      currentUser,
      { page, limit },
      { author, title, searchQ, search },
    );

    return SendSuccess(res, httpStatus.OK, {
      message: "Notes retrieved successfully",
      data: result.notes,
      pagination: result.pagination,
    });
  }

  // Alias for backwards compatibility
  public static getMyNotes = NoteHandler.getNotes;

  public static async getNoteById(req: Request, res: Response) {
    const currentUser = req.user;
    if (!currentUser) {
      throw apiError(httpStatus.UNAUTHORIZED, "Authentication token required");
    }

    const noteId = req.params.id as string;
    const note = await NoteService.getNoteById(currentUser, noteId);

    return SendSuccess(res, httpStatus.OK, {
      message: "Note retrieved successfully",
      data: note,
    });
  }

  public static async updateNote(req: Request, res: Response) {
    const currentUser = req.user;
    if (!currentUser) {
      throw apiError(httpStatus.UNAUTHORIZED, "Authentication token required");
    }

    const noteId = req.params.id as string;
    const updatedNote = await NoteService.updateNote(
      currentUser,
      noteId,
      req.body,
    );

    return SendSuccess(res, httpStatus.OK, {
      message: "Note updated successfully",
      data: updatedNote,
    });
  }

  public static async deleteNote(req: Request, res: Response) {
    const currentUser = req.user;
    if (!currentUser) {
      throw apiError(httpStatus.UNAUTHORIZED, "Authentication token required");
    }

    const noteId = req.params.id as string;
    await NoteService.deleteNote(currentUser, noteId);

    return SendSuccess(res, httpStatus.OK, {
      message: "Note deleted successfully",
      data: null,
    });
  }
}
