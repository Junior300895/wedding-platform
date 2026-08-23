"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rsvpSchema } from "@/lib/validations/rsvp";

type ActionState = { error?: string; success?: boolean };

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
    return { error: parsed.error.errors[0]?.message ?? "Donnees invalides" };
  }

  const data = parsed.data;

  // Le mariage doit exister et etre publie
  const wedding = await db.wedding.findUnique({
    where: { id: data.weddingId },
    select: { id: true, status: true, slug: true },
  });
  if (!wedding || wedding.status !== "PUBLISHED") {
    return { error: "Invitation indisponible" };
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
