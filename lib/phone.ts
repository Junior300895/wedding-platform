/** Numero pour un lien tel: : chiffres et "+" uniquement. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Numero pour un lien wa.me, qui attend le format international sans "+".
 * Un numero senegalais saisi sur 9 chiffres (77 123 45 67) recoit
 * l'indicatif 221. Un autre format sans indicatif ne permet pas de deviner
 * le pays : null, et pas de bouton WhatsApp.
 */
export function whatsappNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (/^(\+|00)/.test(phone.trim())) return digits.replace(/^00/, "") || null;
  if (/^[37]\d{8}$/.test(digits)) return `221${digits}`;
  if (digits.startsWith("221") && digits.length === 12) return digits;
  return null;
}
