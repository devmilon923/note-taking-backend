import z from "zod";

const createNoteValidation = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(3, "Title must be at least 3 characters long")
      .max(50, "Title must be at most 50 characters long"),
    content: z
      .string({ error: "Content is required" })
      .trim()
      .min(10, "Content must be at least 10 characters long"),
  })
  .strict();

const updateNoteValidation = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters long")
      .max(50, "Title must be at most 50 characters long")
      .optional(),
    content: z
      .string()
      .trim()
      .min(10, "Content must be at least 10 characters long")
      .optional(),
  })
  .strict()
  .refine(
    (data) => data.title !== undefined || data.content !== undefined,
    { message: "At least one field (title or content) must be provided for update" },
  );

const paginationValidation = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
});

export const noteValidation = {
  createNoteValidation,
  updateNoteValidation,
  paginationValidation,
};
