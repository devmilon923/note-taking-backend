import z from "zod";

const updateProfileValidation = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long").optional(),
    interests: z.enum(["chess", "coding", "swimming", "reading"]).optional(),
  })
  .strict()
  .refine(
    (data) => data.name !== undefined || data.interests !== undefined,
    { message: "At least one valid field (name or interests) must be provided for update" },
  );

export const userValidation = {
  updateProfileValidation,
};
