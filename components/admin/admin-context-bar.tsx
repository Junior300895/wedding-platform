"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updateWeddingPlanAction } from "@/actions/admin.actions";

type Plan = "ESSENTIEL" | "PREMIUM" | "PRESTIGE";

const PLANS: { value: Plan; label: string }[] = [
  { value: "ESSENTIEL", label: "Essentiel" },
  { value: "PREMIUM", label: "Premium" },
  { value: "PRESTIGE", label: "Prestige" },
];

/**
 * Bandeau affiche quand un administrateur ouvre le mariage d'un client.
 *
 * Le reste de la page est l'espace client : sans ce repere, rien n'indique
 * qu'on modifie les donnees de quelqu'un d'autre.
 */
export function AdminContextBar({
  weddingId,
  ownerName,
  ownerEmail,
  planTier,
}: {
  weddingId: string;
  ownerName: string | null;
  ownerEmail: string;
  planTier: Plan;
}) {
  const [plan, setPlan] = useState<Plan>(planTier);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function change(next: Plan) {
    setPlan(next);
    setSaved(false);
    startTransition(async () => {
      await updateWeddingPlanAction(weddingId, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-amber-800">
            Vue administrateur
          </p>
          <p className="mt-1.5 text-sm text-amber-900">
            Vous modifiez le mariage de{" "}
            <span className="font-medium">
              {ownerName ? `${ownerName} — ` : ""}
              {ownerEmail}
            </span>
            . Vos changements sont visibles immediatement par le client.
          </p>
        </div>
        <Link
          href="/admin/weddings"
          className="shrink-0 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
        >
          &larr; Administration
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-amber-200 pt-4">
        <label htmlFor="planTier" className="text-sm font-medium text-amber-900">
          Offre
        </label>
        <select
          id="planTier"
          value={plan}
          disabled={pending}
          onChange={(e) => change(e.target.value as Plan)}
          className="h-10 rounded-lg border border-amber-300 bg-white px-3 text-sm text-neutral-900 disabled:opacity-60"
        >
          {PLANS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {pending && <span className="text-sm text-amber-700">Enregistrement...</span>}
        {saved && !pending && (
          <span className="text-sm font-medium text-green-700">Offre mise a jour</span>
        )}
        <p className="w-full text-xs text-amber-700">
          Reglable uniquement ici tant que le paiement en ligne n&apos;est pas
          branche.
        </p>
      </div>
    </div>
  );
}
