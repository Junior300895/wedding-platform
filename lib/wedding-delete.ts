import { db } from "./db";
import { storage } from "./storage";

/**
 * Supprime un mariage, ses donnees liees et les fichiers de ses photos.
 *
 * Les evenements, photos, invites et evenements de partage disparaissent
 * en cascade (cf. schema.prisma). Les commandes, elles, survivent avec un
 * weddingId a null : on ne detruit pas un historique de paiement.
 *
 * Partage entre la suppression client et la suppression admin pour eviter
 * deux chemins divergents.
 */
export async function deleteWeddingCascade(
  weddingId: string
): Promise<{ slug: string }> {
  const wedding = await db.wedding.findUnique({
    where: { id: weddingId },
    select: { slug: true, photos: { select: { storageKey: true } } },
  });
  if (!wedding) throw new Error("Mariage introuvable");

  const keys = wedding.photos.map((p) => p.storageKey);

  // La base d'abord : si le stockage echoue ensuite, on laisse des fichiers
  // orphelins (sans gravite) plutot que des lignes pointant vers du vide.
  await db.wedding.delete({ where: { id: weddingId } });

  await Promise.allSettled(keys.map((key) => storage.delete(key)));

  return { slug: wedding.slug };
}
