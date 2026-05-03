import { z } from "zod";

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  email: z
    .string()
    .email()
    .max(255)
    .transform((val) => val.toLowerCase().trim())
    .optional(),
  password: z.string().min(6).max(128).optional(),
  role: z.enum(["user", "admin"]).optional(),
}).strict(); // Ensures no extra fields are passed in updates
