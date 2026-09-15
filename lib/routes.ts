/**
 * Chemin public des invitations, defini a un seul endroit.
 *
 * Il sert a construire les liens partages, les QR codes, les metadonnees
 * et les revalidations de cache : un chemin oublie dans un revalidatePath
 * laisserait la page publique figee sur son ancien contenu.
 *
 * L'ancien prefixe /mariage/ est redirige vers celui-ci (next.config.ts),
 * pour que les liens deja partages continuent de fonctionner.
 */
export const PUBLIC_WEDDING_PREFIX = "/event";

export function weddingPath(slug: string): string {
  return `${PUBLIC_WEDDING_PREFIX}/${slug}`;
}
