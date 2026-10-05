import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const passwordSchema = z.string().min(8, "Must be at least 8 characters").max(128, "Must be at most 128 characters");
export const resetEmailSchema = requiredString.max(254).email().transform(value => value.toLowerCase());

export const signUpSchema = z.object({
  email: requiredString.max(254).email("Invalid email address").transform(value => value.toLowerCase()),
  username: requiredString.max(64).regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed",
  ),
  password: passwordSchema,
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString.max(254),
  password: z.string().min(1).max(128),
});

export type LoginValues = z.infer<typeof loginSchema>;

// --- CORRECTION : PASSAGE À 10 MÉDIAS ---
export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z.array(z.string()).max(10, "Vous ne pouvez pas ajouter plus de 10 fichiers"),
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters"),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const createCommentSchema = z.object({
  content: requiredString,
});
