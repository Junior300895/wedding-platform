"use client";

import { useActionState } from "react";
import { createGuestAction } from "@/actions/guest.actions";
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

  const fieldClass = `h-12 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors focus:border-current ${theme.field}`;
  const labelClass = `mb-1.5 block text-[0.7rem] uppercase tracking-[0.15em] ${theme.accentSoft}`;

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
    <form action={formAction} className="space-y-5 text-left">
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
          className={fieldClass}
        />
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
          className={fieldClass}
        />
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
            className={fieldClass}
          >
            <option value="YES">Je serai present(e)</option>
            <option value="NO">Je ne pourrai pas</option>
            <option value="MAYBE">Peut-etre</option>
          </select>
        </div>
        <div className="sm:w-32">
          <label htmlFor="rsvp-party" className={labelClass}>
            Personnes
          </label>
          <input
            id="rsvp-party"
            name="partySize"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            defaultValue={1}
            className={fieldClass}
          />
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
          className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-colors focus:border-current ${theme.field}`}
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-500"
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
