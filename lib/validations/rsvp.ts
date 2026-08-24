import { z } from "zod";

export const rsvpSchema = z.object({
  weddingId: z.string().min(1),
  name: z
    .string()
    .min(2, "Indiquez votre nom")
    .max(120, "Nom trop long (120 caracteres maximum)"),
  phone: z
    .string()
    .max(30, "Numero trop long")
    .optional()
    .or(z.literal("")),
  response: z.enum(["YES", "NO", "MAYBE"], {
    message: "Indiquez si vous serez la",
  }),
  partySize: z.coerce
    .number({ message: "Indiquez un nombre" })
    .int("Indiquez un nombre entier")
    .min(1, "Au moins une personne")
    .max(20, "20 personnes maximum")
    .default(1),
  message: z
    .string()
    .max(500, "Message trop long (500 caracteres maximum)")
    .optional()
    .or(z.literal("")),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
