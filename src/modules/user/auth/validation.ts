import z from "zod";

const loginValidation = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  })
  .strict();

const interestsSchema = z
  .array(z.enum(["chess", "coding", "music", "travel"]))
  .optional();

const signupValidation = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long"),
    email: z.string().trim().toLowerCase().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    interests: interestsSchema,
  })
  .strict();

export const authValidation = {
  loginValidation,
  signupValidation,
};
