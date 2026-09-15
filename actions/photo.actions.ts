"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { storage, validateImage } from "@/lib/storage";

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

type ActionState = { error?: string; success?: boolean };

export async function uploadPhotoAction(
  weddingId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const wedding = await assertWeddingOwner(weddingId);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Aucun fichier" };
  }

  const check = validateImage(file);
  if (!check.ok) return { error: check.error };

  const count = await db.weddingPhoto.count({ where: { weddingId } });

  let stored;
  try {
    stored = await storage.upload(file, `weddings/${weddingId}`);
  } catch (error) {
    console.error("Echec de l'envoi de la photo :", error);
    return { error: "L'envoi de la photo a echoue. Reessayez dans un instant." };
  }

  try {
    await db.weddingPhoto.create({
      data: {
        weddingId,
        storageKey: stored.storageKey,
        url: stored.url,
        thumbnailUrl: stored.thumbnailUrl ?? null,
        width: stored.width ?? null,
        height: stored.height ?? null,
        mimeType: stored.mimeType,
        size: stored.size,
        sortOrder: count,
        isCover: count === 0, // 1ere photo = couverture par defaut
      },
    });
  } catch (error) {
    // Le fichier est deja stocke : on le retire pour ne pas laisser d'orphelin.
    await storage.delete(stored.storageKey).catch(() => undefined);
    throw error;
  }

  revalidatePath(`/dashboard/mariage/${weddingId}`);
  revalidatePath(`/mariage/${wedding.slug}`);
  return { success: true };
}

export async function deletePhotoAction(photoId: string) {
  const user = await requireUser();
  const photo = await db.weddingPhoto.findUnique({
    where: { id: photoId },
    include: { wedding: { select: { id: true, userId: true, slug: true } } },
  });
  if (!photo) throw new Error("Introuvable");
  if (photo.wedding.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Acces refuse");
  }

  // La base d'abord : une panne reseau vers Cloudinary ne doit pas empecher
  // de retirer la photo de l'invitation.
  await db.weddingPhoto.delete({ where: { id: photoId } });
  await storage.delete(photo.storageKey).catch((error) => {
    console.error("Fichier non supprime du stockage :", photo.storageKey, error);
  });

  revalidatePath(`/dashboard/mariage/${photo.wedding.id}`);
  revalidatePath(`/mariage/${photo.wedding.slug}`);
}

export async function setCoverPhotoAction(photoId: string) {
  const user = await requireUser();
  const photo = await db.weddingPhoto.findUnique({
    where: { id: photoId },
    include: { wedding: { select: { id: true, userId: true, slug: true } } },
  });
  if (!photo) throw new Error("Introuvable");
  if (photo.wedding.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Acces refuse");
  }

  await db.$transaction([
    db.weddingPhoto.updateMany({
      where: { weddingId: photo.wedding.id },
      data: { isCover: false },
    }),
    db.weddingPhoto.update({
      where: { id: photoId },
      data: { isCover: true },
    }),
  ]);

  revalidatePath(`/dashboard/mariage/${photo.wedding.id}`);
  revalidatePath(`/mariage/${photo.wedding.slug}`);
}
