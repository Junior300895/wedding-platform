import { z } from "zod";

export const rsvpSchema = z.object({
  weddingId: z.string().min(1),
  name: z.string().min(2, "Nom requis").max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  response: z.enum(["YES", "NO", "MAYBE"]),
  partySize: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().max(500).optional().or(z.literal("")),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
