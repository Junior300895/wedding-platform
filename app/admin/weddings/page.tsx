import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "Mariages · Admin" };

export default async function AdminWeddingsPage() {
  const weddings = await db.wedding.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      _count: { select: { guests: true, photos: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-neutral-900">Mariages</h1>
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
                    href={`/mariage/${w.slug}`}
                    target="_blank"
                    className="text-brand-600 hover:underline"
                  >
                    /{w.slug}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
