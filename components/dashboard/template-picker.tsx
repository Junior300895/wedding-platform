"use client";

import { useTransition } from "react";
import { updateTemplateAction } from "@/actions/wedding.actions";
import { cn } from "@/lib/utils";

type Template = { id: string; name: string; description: string | null };

export function TemplatePicker({
  weddingId,
  templates,
  current,
}: {
  weddingId: string;
  templates: Template[];
  current: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => {
        const active = t.id === current;
        return (
          <button
            key={t.id}
            disabled={pending}
            onClick={() =>
              startTransition(() => updateTemplateAction(weddingId, t.id))
            }
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              active
                ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-semibold text-neutral-900">{t.name}</span>
              {active && <span className="text-xs text-brand-600">Actif</span>}
            </div>
            <p className="mt-1 text-xs text-neutral-500">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
