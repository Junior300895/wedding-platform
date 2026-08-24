/**
 * Champs du formulaire RSVP, dans l'ordre du DOM.
 *
 * Volontairement isole du schema Zod : ce module est importe par le
 * formulaire (composant client) et n'entraine donc pas zod dans le bundle
 * envoye au navigateur des invites.
 */
export const RSVP_FIELDS = [
  "name",
  "phone",
  "response",
  "partySize",
  "message",
] as const;

export type RsvpField = (typeof RSVP_FIELDS)[number];
export type RsvpFieldErrors = Partial<Record<RsvpField, string>>;
