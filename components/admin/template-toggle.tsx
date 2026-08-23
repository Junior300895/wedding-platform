"use client";

import { useTransition } from "react";
import { toggleTemplateAction } from "@/actions/admin.actions";

export function TemplateToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleTemplateAction(id))}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
      }`}
    >
      {active ? "Actif" : "Inactif"}
    </button>
  );
}
