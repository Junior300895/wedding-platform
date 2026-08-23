import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Parametres" };

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { name: true, email: true, phone: true, role: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-neutral-900">Parametres</h1>
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div>
          <p className="text-sm font-medium text-neutral-500">Nom</p>
          <p className="text-neutral-900">{user?.name ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-500">Email</p>
          <p className="text-neutral-900">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-500">Type de compte</p>
          <p className="text-neutral-900">{user?.role === "ADMIN" ? "Administrateur" : "Client"}</p>
        </div>
      </div>
    </div>
  );
}
