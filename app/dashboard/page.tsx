import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "Mes mariages" };

export default async function DashboardPage() {
  const user = await requireUser();

  const weddings = await db.wedding.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { guests: true, photos: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900">Mes mariages</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gerez vos invitations et suivez les confirmations.
          </p>
        </div>
        <Link
          href="/dashboard/mariage/nouveau"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nouveau
        </Link>
      </div>

      {weddings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="text-neutral-600">Vous n'avez pas encore d'invitation.</p>
          <Link
            href="/dashboard/mariage/nouveau"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Creer ma premiere invitation
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {weddings.map((w) => (
            <Link
              key={w.id}
              href={`/dashboard/mariage/${w.id}`}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-brand-300"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-lg font-semibold text-neutral-900">
                    {w.partnerOne} &amp; {w.partnerTwo}
                  </h2>
                  <StatusBadge status={w.status} />
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatDateFr(w.weddingDate)} · {w._count.guests} RSVP · {w._count.photos} photos
                </p>
              </div>
              <span className="text-sm text-neutral-400">/mariage/{w.slug}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
