import { z } from "zod";

export const weddingSchema = z.object({
  partnerOne: z.string().min(2, "Prenom trop court").max(80),
  partnerTwo: z.string().min(2, "Prenom trop court").max(80),
  weddingDate: z.coerce.date({ message: "Date invalide" }),
  weddingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Heure invalide (HH:MM)")
    .optional()
    .or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional().or(z.literal("")),
  templateId: z.string().optional().or(z.literal("")),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug invalide (a-z, 0-9, tirets)")
    .min(3)
    .max(80),
});

export const weddingEventSchema = z.object({
  type: z.enum(["CEREMONY", "RECEPTION", "OTHER"], { message: "Type invalide" }),
  title: z.string().min(2, "Intitule trop court").max(120, "Intitule trop long"),
  venueName: z.string().min(2, "Nom du lieu trop court").max(160, "Nom du lieu trop long"),
  address: z.string().max(255, "Adresse trop longue").optional().or(z.literal("")),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  mapUrl: z.string().url("Lien invalide").optional().or(z.literal("")),
  startsAt: z.coerce.date({ message: "Date invalide" }).optional().nullable(),
  notes: z.string().max(500, "Texte trop long").optional().or(z.literal("")),
});

export type WeddingInput = z.infer<typeof weddingSchema>;
export type WeddingEventInput = z.infer<typeof weddingEventSchema>;
