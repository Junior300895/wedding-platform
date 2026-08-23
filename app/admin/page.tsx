import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin" };

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const [users, weddings, published, guests, photos, shares, templates] =
    await Promise.all([
      db.user.count(),
      db.wedding.count(),
      db.wedding.count({ where: { status: "PUBLISHED" } }),
      db.guest.count(),
      db.weddingPhoto.count(),
      db.shareEvent.count(),
      db.weddingTemplate.count({ where: { isActive: true } }),
    ]);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-neutral-900">
        Tableau de bord
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={users} />
        <StatCard label="Mariages" value={weddings} />
        <StatCard label="Publies" value={published} />
        <StatCard label="RSVP" value={guests} />
        <StatCard label="Photos" value={photos} />
        <StatCard label="Partages" value={shares} />
        <StatCard label="Templates actifs" value={templates} />
      </div>
    </div>
  );
}
