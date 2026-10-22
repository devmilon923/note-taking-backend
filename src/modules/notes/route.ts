import { Router } from "express";
import authCheck from "../../middleware/authCheck.js";
import { zodValidator } from "../../middleware/zodValidator.js";
import { NoteHandler } from "./handler.js";
import { noteValidation } from "./validation.js";

const router = Router();

// Protect all note routes with authentication
router.use(authCheck(["all"]));

// Search notes alias endpoint
router
  .route("/search")
  .get(NoteHandler.getNotes);

router
  .route("/")
  .post(
    zodValidator(noteValidation.createNoteValidation),
    NoteHandler.createNote,
  )
  .get(NoteHandler.getNotes);

router
  .route("/:id")
  .get(NoteHandler.getNoteById)
  .patch(
    zodValidator(noteValidation.updateNoteValidation),
    NoteHandler.updateNote,
  )
  .put(
    zodValidator(noteValidation.updateNoteValidation),
    NoteHandler.updateNote,
  )
  .delete(NoteHandler.deleteNote);

const NoteRoutes = router;
export default NoteRoutes;
