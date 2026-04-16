import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name too long").trim(),
    email: z.string().email("Invalid email format").trim().toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "STUDENT", "FACULTY", "DRIVER"]).optional(),
}).strict();

export const loginSchema = z.object({
    email: z.string().email("Invalid email format").trim().toLowerCase(),
    password: z.string().min(6, "Password cannot be less than 6 characters")
}).strict();

export const resetPasswordSchema = z.object({
    password: z.string().min(6, "New password must be at least 6 characters").max(100)
}).strict();
