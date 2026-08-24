"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rsvpSchema } from "@/lib/validations/rsvp";
import { RSVP_FIELDS, type RsvpFieldErrors } from "@/lib/validations/rsvp-fields";

type ActionState = {
  /** Erreur globale : rien a rattacher a un champ precis. */
  error?: string;
  /** Erreurs rattachees a un champ, pour un message au bon endroit. */
  fieldErrors?: RsvpFieldErrors;
  success?: boolean;
};

/**
 * RSVP public : cree un invite sans authentification.
 * Note : prevoir rate-limiting / anti-spam en production (cf. doc sec. 16).
 */
export async function createGuestAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = rsvpSchema.safeParse({
    weddingId: formData.get("weddingId"),
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    response: formData.get("response"),
    partySize: formData.get("partySize") ?? 1,
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: RsvpFieldErrors = {};
    for (const field of RSVP_FIELDS) {
      const message = flat[field]?.[0];
      if (message) fieldErrors[field] = message;
    }
    // Un probleme hors formulaire (weddingId absent) n'a aucun champ ou
    // s'afficher : on le remonte en message global.
    if (Object.keys(fieldErrors).length === 0) {
      return { error: "Donnees invalides. Rechargez la page et reessayez." };
    }
    return { fieldErrors };
  }

  const data = parsed.data;

  // Le mariage doit exister et etre publie
  const wedding = await db.wedding.findUnique({
    where: { id: data.weddingId },
    select: { id: true, status: true, slug: true },
  });
  if (!wedding || wedding.status !== "PUBLISHED") {
    return { error: "Cette invitation n'est plus disponible." };
  }

  await db.guest.create({
    data: {
      weddingId: data.weddingId,
      name: data.name,
      phone: data.phone || null,
      response: data.response,
      partySize: data.partySize,
      message: data.message || null,
    },
  });

  revalidatePath(`/mariage/${wedding.slug}`);
  return { success: true };
}

/** Suppression d'un invite (cote proprietaire/dashboard). */
export async function deleteGuestAction(guestId: string) {
  const user = await requireUser();
  const guest = await db.guest.findUnique({
    where: { id: guestId },
    include: { wedding: { select: { userId: true, id: true } } },
  });
  if (!guest) throw new Error("Introuvable");
  if (guest.wedding.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Acces refuse");
  }
  await db.guest.delete({ where: { id: guestId } });
  revalidatePath(`/dashboard/mariage/${guest.wedding.id}`);
}
