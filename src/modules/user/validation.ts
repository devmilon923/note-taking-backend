import z from "zod";

const interestsSchema = z
  .union([
    z.array(z.string().trim().min(1, "Interest cannot be empty")),
    z.string().trim().min(1, "Interest cannot be empty").transform((val) => [val]),
  ])
  .optional();

const updateProfileValidation = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long").optional(),
    interests: interestsSchema,
  })
  .strict()
  .refine(
    (data) => data.name !== undefined || data.interests !== undefined,
    { message: "At least one valid field (name or interests) must be provided for update" },
  );

const adminCreateUserValidation = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long"),
    email: z.string().trim().toLowerCase().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["user", "admin"]).optional().default("user"),
    interests: interestsSchema,
  })
  .strict();

const adminUpdateUserValidation = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long").optional(),
    role: z.enum(["user", "admin"]).optional(),
    interests: interestsSchema,
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined || data.role !== undefined || data.interests !== undefined,
    { message: "At least one valid field (name, role, or interests) must be provided for update" },
  );

const paginationValidation = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
});

export const userValidation = {
  updateProfileValidation,
  adminCreateUserValidation,
  adminUpdateUserValidation,
  paginationValidation,
};
