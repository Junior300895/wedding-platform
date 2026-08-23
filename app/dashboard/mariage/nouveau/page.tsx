import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { WeddingCreateForm } from "@/components/dashboard/wedding-create-form";

export const metadata: Metadata = { title: "Nouveau mariage" };

export default async function NewWeddingPage() {
  await requireUser();
  const templates = await db.weddingTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, description: true },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Retour
      </Link>
      <h1 className="mb-6 mt-2 font-serif text-2xl font-bold text-neutral-900">
        Nouveau mariage
      </h1>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
        <WeddingCreateForm templates={templates} />
      </div>
    </div>
  );
}
