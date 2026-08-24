"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteWeddingAdminAction } from "@/actions/admin.actions";

type Counts = { guests: number; photos: number; events: number };

function Losses({ counts }: { counts: Counts }) {
  const parts = [
    counts.events > 0 &&
      `${counts.events} etape${counts.events > 1 ? "s" : ""} du programme`,
    counts.photos > 0 && `${counts.photos} photo${counts.photos > 1 ? "s" : ""}`,
    counts.guests > 0 &&
      `${counts.guests} reponse${counts.guests > 1 ? "s" : ""} RSVP`,
  ].filter(Boolean) as string[];

  if (parts.length === 0) {
    return (
      <p className="text-sm text-neutral-600">
        Ce mariage ne contient encore ni programme, ni photo, ni reponse.
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-red-50 p-4">
      <p className="text-sm font-medium text-red-900">
        Seront definitivement effaces :
      </p>
      <ul className="mt-2 space-y-1 text-sm text-red-800">
        {parts.map((p) => (
          <li key={p}>— {p}</li>
        ))}
      </ul>
    </div>
  );
}

export function WeddingDeleteButton({
  id,
  slug,
  partnerOne,
  partnerTwo,
  clientEmail,
  counts,
}: {
  id: string;
  slug: string;
  partnerOne: string;
  partnerTwo: string;
  clientEmail: string;
  counts: Counts;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const action = deleteWeddingAdminAction.bind(null, id);
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending]);

  // La ligne disparait au revalidate ; on referme si le composant survit.
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  function close() {
    if (pending) return;
    setOpen(false);
    setTyped("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Supprimer
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`del-title-${id}`}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id={`del-title-${id}`}
              className="font-serif text-xl font-bold text-neutral-900"
            >
              Supprimer {partnerOne} &amp; {partnerTwo} ?
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Ce mariage appartient a{" "}
              <span className="font-medium text-neutral-900">{clientEmail}</span>.
              L&apos;invitation publique ne sera plus accessible et l&apos;action
              est irreversible.
            </p>

            <div className="mt-4">
              <Losses counts={counts} />
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              Les commandes et paiements eventuels sont conserves.
            </p>

            <form action={formAction} className="mt-5">
              <label
                htmlFor={`confirm-${id}`}
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Saisissez{" "}
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.8em] text-neutral-900">
                  {slug}
                </code>{" "}
                pour confirmer
              </label>
              <input
                id={`confirm-${id}`}
                name="confirmSlug"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                autoFocus
                className="h-11 w-full rounded-lg border border-neutral-300 px-3.5 font-mono text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />

              {state?.error && (
                <p
                  role="alert"
                  className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {state.error}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={pending}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={pending || typed !== slug}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending ? "Suppression..." : "Supprimer definitivement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
