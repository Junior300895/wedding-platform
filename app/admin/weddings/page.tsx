import { weddingPath } from "@/lib/routes";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/badge";
import { WeddingDeleteButton } from "@/components/admin/wedding-delete-button";
import { formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "Mariages · Admin" };

export default async function AdminWeddingsPage() {
  const weddings = await db.wedding.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      _count: { select: { guests: true, photos: true, events: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">Mariages</h1>
        <Link
          href="/admin/weddings/nouveau"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Nouveau mariage
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Maries</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">RSVP</th>
              <th className="px-4 py-3 font-medium">Lien</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {weddings.map((w) => (
              <tr key={w.id}>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {w.partnerOne} &amp; {w.partnerTwo}
                </td>
                <td className="px-4 py-3 text-neutral-600">{w.user.email}</td>
                <td className="px-4 py-3 text-neutral-500">{formatDateFr(w.weddingDate)}</td>
                <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                <td className="px-4 py-3 text-neutral-600">{w._count.guests}</td>
                <td className="px-4 py-3">
                  <Link
                    href={weddingPath(w.slug)}
                    target="_blank"
                    className="text-brand-600 hover:underline"
                  >
                    /{w.slug}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/dashboard/mariage/${w.id}`}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      Modifier
                    </Link>
                    <WeddingDeleteButton
                    id={w.id}
                    slug={w.slug}
                    partnerOne={w.partnerOne}
                    partnerTwo={w.partnerTwo}
                    clientEmail={w.user.email}
                    counts={{
                      guests: w._count.guests,
                      photos: w._count.photos,
                      events: w._count.events,
                    }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
