import { z } from "zod";
import { weddingSchema } from "./wedding";

/** Mariage cree depuis l'administration : l'offre est fixee a la main. */
export const adminWeddingSchema = weddingSchema.extend({
  planTier: z.enum(["ESSENTIEL", "PREMIUM", "PRESTIGE"], {
    message: "Offre invalide",
  }),
});

/** Compte client cree par l'administration (mot de passe genere). */
export const newClientSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(80),
  email: z.string().email("Email invalide"),
  phone: z.string().max(30).optional().or(z.literal("")),
});

export type AdminWeddingInput = z.infer<typeof adminWeddingSchema>;
export type NewClientInput = z.infer<typeof newClientSchema>;
