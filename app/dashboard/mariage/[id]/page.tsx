import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/badge";
import { WeddingEditForm } from "@/components/dashboard/wedding-edit-form";
import { TemplatePicker } from "@/components/dashboard/template-picker";
import { EventManager } from "@/components/dashboard/event-manager";
import { PhotoManager } from "@/components/dashboard/photo-manager";
import { GuestList } from "@/components/dashboard/guest-list";
import { PublishPanel } from "@/components/dashboard/publish-panel";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Gestion du mariage" };

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-5 font-serif text-lg font-semibold text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}

export default async function WeddingManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const wedding = await db.wedding.findUnique({
    where: { id },
    include: {
      events: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
      guests: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!wedding) notFound();
  if (wedding.userId !== user.id && user.role !== "ADMIN") notFound();

  const templates = await db.weddingTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, description: true },
  });

  const publicUrl = absoluteUrl(`/mariage/${wedding.slug}`);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-800">
          ← Mes mariages
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-bold text-neutral-900">
            {wedding.partnerOne} &amp; {wedding.partnerTwo}
          </h1>
          <StatusBadge status={wedding.status} />
        </div>
      </div>

      <Section title="Publication & partage">
        <PublishPanel
          weddingId={wedding.id}
          status={wedding.status}
          publicUrl={publicUrl}
          partnerOne={wedding.partnerOne}
          partnerTwo={wedding.partnerTwo}
        />
      </Section>

      <Section title="Informations">
        <WeddingEditForm wedding={wedding} />
      </Section>

      <Section title="Programme">
        <EventManager weddingId={wedding.id} events={wedding.events} />
      </Section>

      <Section title="Design">
        <TemplatePicker
          weddingId={wedding.id}
          templates={templates}
          current={wedding.templateId}
        />
      </Section>

      <Section title="Galerie photo">
        <PhotoManager weddingId={wedding.id} photos={wedding.photos} />
      </Section>

      <Section title="Confirmations (RSVP)">
        <GuestList guests={wedding.guests} />
      </Section>
    </div>
  );
}
