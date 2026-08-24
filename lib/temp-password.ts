import { randomInt } from "crypto";

/**
 * Alphabet sans caracteres ambigus (0/O, 1/l/I) : le mot de passe sera
 * souvent recopie a la main ou dicte par telephone.
 */
const ALPHABET = "abcdefghijkmnopqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Mot de passe temporaire pour un compte cree par l'administration.
 * Genere cote serveur, affiche une seule fois, jamais stocke en clair.
 */
export function generateTempPassword(length = 12): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}
