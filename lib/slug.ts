import { db } from "./db";

/**
 * Rend un slug unique en suffixant un compteur si besoin.
 *
 * `ignoreId` permet a un mariage de conserver son propre slug lors d'une
 * modification. La boucle est bornee : au-dela, on bascule sur un suffixe
 * aleatoire plutot que de tourner indefiniment.
 */
export async function ensureUniqueWeddingSlug(
  base: string,
  ignoreId?: string
): Promise<string> {
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i}`;
    const found = await db.wedding.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!found || found.id === ignoreId) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
