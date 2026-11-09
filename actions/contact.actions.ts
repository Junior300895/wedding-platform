"use server";

import { weddingPath } from "@/lib/routes";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { weddingContactSchema } from "@/lib/validations/wedding";

type ActionState = { error?: string; success?: boolean };

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

async function assertContactOwner(contactId: string) {
  const user = await requireUser();
  const contact = await db.weddingContact.findUnique({
    where: { id: contactId },
    include: { wedding: { select: { id: true, userId: true, slug: true } } },
  });
  if (!contact) throw new Error("Contact introuvable");
  if (contact.wedding.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Acces refuse");
  }
  return contact;
}

function revalidateWedding(weddingId: string, slug: string) {
  revalidatePath(`/dashboard/mariage/${weddingId}`);
  revalidatePath(weddingPath(slug));
}

function parseContactForm(formData: FormData) {
  return weddingContactSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    role: formData.get("role") ?? "",
  });
}

export async function createContactAction(
  weddingId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const wedding = await assertWeddingOwner(weddingId);
  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Donnees invalides" };
  }

  const count = await db.weddingContact.count({ where: { weddingId } });
  await db.weddingContact.create({
    data: {
      weddingId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      role: parsed.data.role || null,
      sortOrder: count,
    },
  });

  revalidateWedding(wedding.id, wedding.slug);
  return { success: true };
}

export async function updateContactAction(
  contactId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const contact = await assertContactOwner(contactId);
  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Donnees invalides" };
  }

  await db.weddingContact.update({
    where: { id: contactId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      role: parsed.data.role || null,
    },
  });

  revalidateWedding(contact.wedding.id, contact.wedding.slug);
  return { success: true };
}

export async function deleteContactAction(contactId: string) {
  const contact = await assertContactOwner(contactId);
  await db.weddingContact.delete({ where: { id: contactId } });
  revalidateWedding(contact.wedding.id, contact.wedding.slug);
}
