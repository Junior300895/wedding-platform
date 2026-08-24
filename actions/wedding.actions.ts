"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { weddingSchema } from "@/lib/validations/wedding";
import { buildWeddingSlug } from "@/lib/utils";
import { deleteWeddingCascade } from "@/lib/wedding-delete";
import { ensureUniqueWeddingSlug } from "@/lib/slug";

type ActionState = { error?: string; success?: boolean; id?: string };

/** Verifie que le mariage appartient a l'utilisateur courant (ou admin). */
async function assertOwnership(weddingId: string) {
  const user = await requireUser();
  const wedding = await db.wedding.findUnique({
    where: { id: weddingId },
    select: { id: true, userId: true },
  });
  if (!wedding) throw new Error("Mariage introuvable");
  if (wedding.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Acces refuse");
  }
  return { user, wedding };
}

export async function createWeddingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const partnerOne = String(formData.get("partnerOne") ?? "");
  const partnerTwo = String(formData.get("partnerTwo") ?? "");
  const proposedSlug =
    String(formData.get("slug") ?? "") || buildWeddingSlug(partnerOne, partnerTwo);

  const parsed = weddingSchema.safeParse({
    partnerOne,
    partnerTwo,
    weddingDate: formData.get("weddingDate"),
    weddingTime: formData.get("weddingTime") ?? "",
    message: formData.get("message") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    templateId: formData.get("templateId") ?? "",
    slug: proposedSlug,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Donnees invalides" };
  }

  const data = parsed.data;
  const slug = await ensureUniqueWeddingSlug(data.slug);

  const wedding = await db.wedding.create({
    data: {
      slug,
      partnerOne: data.partnerOne,
      partnerTwo: data.partnerTwo,
      weddingDate: data.weddingDate,
      weddingTime: data.weddingTime || null,
      message: data.message || null,
      contactPhone: data.contactPhone || null,
      templateId: data.templateId || null,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/mariage/${wedding.id}`);
}

export async function updateWeddingAction(
  weddingId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertOwnership(weddingId);

  const parsed = weddingSchema.safeParse({
    partnerOne: formData.get("partnerOne"),
    partnerTwo: formData.get("partnerTwo"),
    weddingDate: formData.get("weddingDate"),
    weddingTime: formData.get("weddingTime") ?? "",
    message: formData.get("message") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    templateId: formData.get("templateId") ?? "",
    slug: String(formData.get("slug") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Donnees invalides" };
  }

  const data = parsed.data;
  const slug = await ensureUniqueWeddingSlug(data.slug, weddingId);

  await db.wedding.update({
    where: { id: weddingId },
    data: {
      slug,
      partnerOne: data.partnerOne,
      partnerTwo: data.partnerTwo,
      weddingDate: data.weddingDate,
      weddingTime: data.weddingTime || null,
      message: data.message || null,
      contactPhone: data.contactPhone || null,
      templateId: data.templateId || null,
    },
  });

  revalidatePath(`/dashboard/mariage/${weddingId}`);
  revalidatePath(`/mariage/${slug}`);
  return { success: true };
}

export async function updateTemplateAction(weddingId: string, templateId: string) {
  await assertOwnership(weddingId);
  await db.wedding.update({
    where: { id: weddingId },
    data: { templateId },
  });
  revalidatePath(`/dashboard/mariage/${weddingId}`);
}

export async function publishWeddingAction(weddingId: string) {
  const { wedding } = await assertOwnership(weddingId);
  // On recupere le slug pour revalider la page publique
  const w = await db.wedding.update({
    where: { id: wedding.id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
    select: { slug: true },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/mariage/${w.slug}`);
}

export async function archiveWeddingAction(weddingId: string) {
  await assertOwnership(weddingId);
  await db.wedding.update({
    where: { id: weddingId },
    data: { status: "ARCHIVED" },
  });
  revalidatePath("/dashboard");
}

export async function unpublishWeddingAction(weddingId: string) {
  await assertOwnership(weddingId);
  await db.wedding.update({
    where: { id: weddingId },
    data: { status: "DRAFT" },
  });
  revalidatePath("/dashboard");
}

export async function deleteWeddingAction(weddingId: string) {
  await assertOwnership(weddingId);
  const { slug } = await deleteWeddingCascade(weddingId);
  revalidatePath("/dashboard");
  revalidatePath(`/mariage/${slug}`);
  redirect("/dashboard");
}
