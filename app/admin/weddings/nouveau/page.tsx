import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { AdminWeddingCreateForm } from "@/components/admin/admin-wedding-create-form";

export const metadata: Metadata = { title: "Nouveau mariage · Admin" };

export default async function AdminNewWeddingPage() {
  const [users, templates] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { weddings: true } },
      },
    }),
    db.weddingTemplate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, description: true },
    }),
  ]);

  const clients = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    weddings: u._count.weddings,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/weddings"
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        &larr; Mariages
      </Link>
      <h1 className="mb-6 mt-2 font-serif text-2xl font-bold text-neutral-900">
        Nouveau mariage
      </h1>
      <AdminWeddingCreateForm clients={clients} templates={templates} />
    </div>
  );
}
