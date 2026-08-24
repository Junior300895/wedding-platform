"use client";

import { useActionState, useEffect, useRef } from "react";
import { createGuestAction } from "@/actions/guest.actions";
import { RSVP_FIELDS, type RsvpField } from "@/lib/validations/rsvp-fields";
import type { Theme } from "./types";

export function RsvpForm({
  weddingId,
  accentBtn,
  theme,
}: {
  weddingId: string;
  accentBtn: string;
  theme: Theme;
}) {
  const [state, formAction, pending] = useActionState(createGuestAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  const errors = state?.fieldErrors ?? {};

  // Apres un envoi refuse, on emmene l'invite sur le premier champ fautif
  // plutot que de lui laisser chercher.
  useEffect(() => {
    const first = RSVP_FIELDS.find((f) => errors[f]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`#rsvp-${first}`);
    el?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Le filet du theme est remplace, jamais superpose : aucun conflit de
  // classes a arbitrer, donc pas de tailwind-merge dans le bundle invite.
  const fieldClass = (field: RsvpField) =>
    `h-12 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors focus:border-current ${
      theme.field
    } ${errors[field] ? "border-red-600" : theme.fieldBorder}`;

  const labelClass = `mb-1.5 block text-[0.7rem] uppercase tracking-[0.15em] ${theme.accentSoft}`;

  function FieldError({ field }: { field: RsvpField }) {
    if (!errors[field]) return null;
    return (
      <p id={`rsvp-${field}-error`} className={`mt-1.5 text-sm ${theme.fieldError}`}>
        {errors[field]}
      </p>
    );
  }

  /** Attributs qui relient un champ a son message d'erreur. */
  const a11y = (field: RsvpField) =>
    errors[field]
      ? { "aria-invalid": true as const, "aria-describedby": `rsvp-${field}-error` }
      : {};

  if (state?.success) {
    return (
      <div className="py-6 text-center">
        <p className="font-serif text-3xl">Merci !</p>
        <p className="mt-3 opacity-70">
          Votre reponse est enregistree. Nous avons hate de vous y voir.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-5 text-left">
      <input type="hidden" name="weddingId" value={weddingId} />

      <div>
        <label htmlFor="rsvp-name" className={labelClass}>
          Votre nom
        </label>
        <input
          id="rsvp-name"
          name="name"
          required
          autoComplete="name"
          placeholder="Moussa Diop"
          className={fieldClass("name")}
          {...a11y("name")}
        />
        <FieldError field="name" />
      </div>

      <div>
        <label htmlFor="rsvp-phone" className={labelClass}>
          Telephone
        </label>
        <input
          id="rsvp-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="77 000 00 00"
          className={fieldClass("phone")}
          {...a11y("phone")}
        />
        <FieldError field="phone" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="rsvp-response" className={labelClass}>
            Serez-vous la ?
          </label>
          <select
            id="rsvp-response"
            name="response"
            required
            className={fieldClass("response")}
            {...a11y("response")}
          >
            <option value="YES">Je serai present(e)</option>
            <option value="NO">Je ne pourrai pas</option>
            <option value="MAYBE">Peut-etre</option>
          </select>
          <FieldError field="response" />
        </div>
        <div className="sm:w-32">
          <label htmlFor="rsvp-partySize" className={labelClass}>
            Personnes
          </label>
          <input
            id="rsvp-partySize"
            name="partySize"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            defaultValue={1}
            className={fieldClass("partySize")}
            {...a11y("partySize")}
          />
          <FieldError field="partySize" />
        </div>
      </div>

      <div>
        <label htmlFor="rsvp-message" className={labelClass}>
          Un mot pour les maries
        </label>
        <textarea
          id="rsvp-message"
          name="message"
          rows={3}
          placeholder="Facultatif"
          className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-colors focus:border-current ${
            theme.field
          } ${errors.message ? "border-red-600" : theme.fieldBorder}`}
          {...a11y("message")}
        />
        <FieldError field="message" />
      </div>

      {/* Erreur globale : rien a rattacher a un champ (invitation retiree...) */}
      {state?.error && (
        <p
          role="alert"
          className={`rounded-xl border border-red-600/40 bg-red-600/10 px-3.5 py-2.5 text-sm ${theme.fieldError}`}
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`h-12 w-full rounded-xl text-sm font-medium tracking-wide transition-opacity disabled:opacity-50 ${accentBtn}`}
      >
        {pending ? "Envoi..." : "Confirmer ma presence"}
      </button>
    </form>
  );
}
