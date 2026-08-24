import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import QRCode from "qrcode";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/badge";
import { ShareStudio } from "@/components/dashboard/share-studio";
import { absoluteUrl, formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "Partager l'invitation" };

const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  LINK: "Lien copie",
  QRCODE: "QR code",
  FACEBOOK: "Facebook",
  OTHER: "Autre",
};

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="font-serif text-lg font-semibold text-neutral-900">{title}</h2>
      {hint && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const wedding = await db.wedding.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      status: true,
      partnerOne: true,
      partnerTwo: true,
      weddingDate: true,
      userId: true,
    },
  });

  if (!wedding) notFound();
  if (wedding.userId !== user.id && user.role !== "ADMIN") notFound();

  const publicUrl = absoluteUrl(`/mariage/${wedding.slug}`);
  const published = wedding.status === "PUBLISHED";

  // Deux formats : un SVG (impression, taille libre) et un PNG haute
  // definition. Correction d'erreur maximale : un code imprime peut etre
  // plie, taché ou partiellement masque.
  const [qrSvg, qrPngHiRes] = await Promise.all([
    QRCode.toString(publicUrl, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#111111", light: "#ffffff" },
    }),
    QRCode.toDataURL(publicUrl, {
      width: 2048,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#111111", light: "#ffffff" },
    }),
  ]);

  const qrSvgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`;

  const grouped = await db.shareEvent.groupBy({
    by: ["channel"],
    where: { weddingId: wedding.id },
    _count: { _all: true },
  });
  const stats = grouped
    .map((g) => ({ channel: g.channel as string, count: g._count._all }))
    .sort((a, b) => b.count - a.count);
  const totalShares = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/dashboard/mariage/${wedding.id}`}
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          &larr; {wedding.partnerOne} &amp; {wedding.partnerTwo}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl font-bold text-neutral-900">
            Partager l&apos;invitation
          </h1>
          <StatusBadge status={wedding.status} />
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {formatDateFr(wedding.weddingDate)}
        </p>
      </div>

      {!published && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <p className="font-medium text-amber-900">
            Votre invitation n&apos;est pas encore en ligne
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Le lien et le QR code ci-dessous fonctionnent deja, mais vos invites
            verront une page introuvable tant que vous n&apos;avez pas publie.
          </p>
          <Link
            href={`/dashboard/mariage/${wedding.id}`}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-amber-900 px-4 text-sm font-medium text-white hover:bg-amber-800"
          >
            Publier l&apos;invitation
          </Link>
        </div>
      )}

      <ShareStudio
        weddingId={wedding.id}
        publicUrl={publicUrl}
        partnerOne={wedding.partnerOne}
        partnerTwo={wedding.partnerTwo}
        weddingDate={formatDateFr(wedding.weddingDate)}
        qrSvgDataUri={qrSvgDataUri}
        qrPngHiRes={qrPngHiRes}
      />

      <Card
        title="Diffusion"
        hint={
          totalShares > 0
            ? "Nombre de fois ou l'invitation a ete transmise, par canal."
            : undefined
        }
      >
        {totalShares === 0 ? (
          <p className="text-sm text-neutral-500">
            Aucun partage pour l&apos;instant. Envoyez le lien a vos proches : les
            transmissions apparaitront ici, y compris celles faites par vos
            invites depuis la page publique.
          </p>
        ) : (
          <div className="space-y-3">
            {stats.map((s) => (
              <div key={s.channel}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-neutral-700">
                    {CHANNEL_LABELS[s.channel] ?? s.channel}
                  </span>
                  <span className="font-medium tabular-nums text-neutral-900">
                    {s.count}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.round((s.count / totalShares) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="border-t border-neutral-100 pt-3 text-sm text-neutral-500">
              {totalShares} partage{totalShares > 1 ? "s" : ""} au total
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
