import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(80),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caracteres minimum").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
