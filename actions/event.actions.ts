"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { weddingEventSchema } from "@/lib/validations/wedding";

type ActionState = { error?: string; success?: boolean };

/** Verifie que le mariage appartient a l'utilisateur courant (ou admin). */
async function assertWeddingOwner(weddingId: string) {
  const user = await requireUser();
  const wedding = await db.wedding.findUnique({
    where: { id: weddingId },
    select: { id: true, userId: true, slug: true },
  });
  if (!wedding) throw new Error("Mariage introuvable");
  if (wedding.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Acces refuse");
  }
  return wedding;
}

/** Idem, en partant de l'evenement. */
async function assertEventOwner(eventId: string) {
  const user = await requireUser();
  const event = await db.weddingEvent.findUnique({
    where: { id: eventId },
    include: { wedding: { select: { id: true, userId: true, slug: true } } },
  });
  if (!event) throw new Error("Evenement introuvable");
  if (event.wedding.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Acces refuse");
  }
  return event;
}

function revalidateWedding(weddingId: string, slug: string) {
  revalidatePath(`/dashboard/mariage/${weddingId}`);
  revalidatePath(`/mariage/${slug}`);
}

/**
 * Renumerote les evenements de 0 a n-1 dans l'ordre fourni.
 * Garde sortOrder dense apres un ajout, une suppression ou un deplacement.
 */
function renumber(ids: string[]) {
  return ids.map((id, index) =>
    db.weddingEvent.update({ where: { id }, data: { sortOrder: index } })
  );
}

/** Lit le formulaire et valide, en normalisant les champs vides en null. */
function parseEventForm(formData: FormData) {
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();

  return weddingEventSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    venueName: formData.get("venueName"),
    address: formData.get("address") ?? "",
    mapUrl: formData.get("mapUrl") ?? "",
    notes: formData.get("notes") ?? "",
    startsAt: startsAtRaw === "" ? null : startsAtRaw,
  });
}

export async function createEventAction(
  weddingId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const wedding = await assertWeddingOwner(weddingId);

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  const count = await db.weddingEvent.count({ where: { weddingId } });

  await db.weddingEvent.create({
    data: {
      weddingId,
      type: data.type,
      title: data.title,
      venueName: data.venueName,
      address: data.address || null,
      mapUrl: data.mapUrl || null,
      notes: data.notes || null,
      startsAt: data.startsAt ?? null,
      sortOrder: count,
    },
  });

  revalidateWedding(wedding.id, wedding.slug);
  return { success: true };
}

export async function updateEventAction(
  eventId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const event = await assertEventOwner(eventId);

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Donnees invalides" };
  }
  const data = parsed.data;

  await db.weddingEvent.update({
    where: { id: eventId },
    data: {
      type: data.type,
      title: data.title,
      venueName: data.venueName,
      address: data.address || null,
      mapUrl: data.mapUrl || null,
      notes: data.notes || null,
      startsAt: data.startsAt ?? null,
    },
  });

  revalidateWedding(event.wedding.id, event.wedding.slug);
  return { success: true };
}

export async function deleteEventAction(eventId: string) {
  const event = await assertEventOwner(eventId);

  const siblings = await db.weddingEvent.findMany({
    where: { weddingId: event.wedding.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  const remaining = siblings.map((e) => e.id).filter((id) => id !== eventId);

  await db.$transaction([
    db.weddingEvent.delete({ where: { id: eventId } }),
    ...renumber(remaining),
  ]);

  revalidateWedding(event.wedding.id, event.wedding.slug);
}

/** Deplace un evenement d'un cran dans le programme. */
export async function moveEventAction(eventId: string, direction: "up" | "down") {
  const event = await assertEventOwner(eventId);

  const siblings = await db.weddingEvent.findMany({
    where: { weddingId: event.wedding.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });

  const ids = siblings.map((e) => e.id);
  const from = ids.indexOf(eventId);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= ids.length) return;

  [ids[from], ids[to]] = [ids[to], ids[from]];

  await db.$transaction(renumber(ids));

  revalidateWedding(event.wedding.id, event.wedding.slug);
}
