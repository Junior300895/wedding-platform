import type { Metadata } from "next";
import { db } from "@/lib/db";
import { TemplateToggle } from "@/components/admin/template-toggle";

export const metadata: Metadata = { title: "Templates · Admin" };

export default async function AdminTemplatesPage() {
  const templates = await db.weddingTemplate.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { weddings: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-neutral-900">Templates</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-neutral-900">{t.name}</h2>
              <TemplateToggle id={t.id} active={t.isActive} />
            </div>
            <p className="mt-1 text-sm text-neutral-500">{t.description}</p>
            <p className="mt-3 text-xs text-neutral-400">
              Offre min. : {t.minTier} · {t._count.weddings} mariage(s)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
