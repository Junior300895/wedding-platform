"use server";

import { weddingPath } from "@/lib/routes";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  createVideoUploadParams,
  finalizeCloudinaryVideo,
  storage,
  usesCloudinary,
  validateImage,
  type StoredFile,
} from "@/lib/storage";
import { MAX_VIDEO_SIZE, validateVideoFile } from "@/lib/media";

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
  revalidatePath(weddingPath(wedding.slug));
  return { success: true };
}

/** Enregistre la video et en fait la couverture du mariage. */
async function saveCoverVideo(weddingId: string, slug: string, stored: StoredFile) {
  try {
    const count = await db.weddingPhoto.count({ where: { weddingId } });
    await db.$transaction([
      db.weddingPhoto.updateMany({
        where: { weddingId },
        data: { isCover: false },
      }),
      db.weddingPhoto.create({
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
          isCover: true,
        },
      }),
    ]);
  } catch (error) {
    await storage.delete(stored.storageKey).catch(() => undefined);
    throw error;
  }

  revalidatePath(`/dashboard/mariage/${weddingId}`);
  revalidatePath(weddingPath(slug));
}

export type VideoUploadTarget =
  | { mode: "server" }
  | {
      mode: "direct";
      cloudName: string;
      apiKey: string;
      folder: string;
      allowedFormats: string;
      timestamp: number;
      signature: string;
    };

/** Premiere etape : indique au navigateur comment envoyer sa video. */
export async function prepareVideoUploadAction(
  weddingId: string,
  file: { type: string; size: number }
): Promise<{ error: string } | { target: VideoUploadTarget }> {
  await assertWeddingOwner(weddingId);

  const invalid = validateVideoFile(file);
  if (invalid) return { error: invalid };

  if (!usesCloudinary()) return { target: { mode: "server" } };

  const params = createVideoUploadParams(`weddings/${weddingId}`);
  return {
    target: {
      mode: "direct",
      cloudName: params.cloudName,
      apiKey: params.apiKey,
      folder: params.folder,
      allowedFormats: params.allowed_formats,
      timestamp: params.timestamp,
      signature: params.signature,
    },
  };
}

/** Apres l'envoi direct a Cloudinary. */
export async function completeVideoUploadAction(
  weddingId: string,
  publicId: string
): Promise<ActionState> {
  const wedding = await assertWeddingOwner(weddingId);

  let stored: StoredFile;
  try {
    stored = await finalizeCloudinaryVideo(
      publicId,
      `weddings/${weddingId}`,
      MAX_VIDEO_SIZE
    );
  } catch (error) {
    console.error("Video refusee :", error);
    return { error: "La video n'a pas pu etre enregistree." };
  }

  await saveCoverVideo(weddingId, wedding.slug, stored);
  return { success: true };
}

/** Stockage local (developpement) : la video passe par le serveur. */
export async function uploadLocalVideoAction(
  weddingId: string,
  formData: FormData
): Promise<ActionState> {
  const wedding = await assertWeddingOwner(weddingId);
  if (usesCloudinary()) return { error: "Envoi direct requis." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Aucun fichier" };
  }
  const invalid = validateVideoFile(file);
  if (invalid) return { error: invalid };

  const stored = await storage.upload(file, `weddings/${weddingId}`);
  await saveCoverVideo(weddingId, wedding.slug, stored);
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
  revalidatePath(weddingPath(photo.wedding.slug));
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
  revalidatePath(weddingPath(photo.wedding.slug));
}
