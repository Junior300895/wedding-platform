import { weddingPath } from "@/lib/routes";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";
import { getTheme } from "@/components/templates/registry";
import { WeddingTemplate } from "@/components/templates/wedding-template";
import type { PublicWedding } from "@/components/templates/types";

// Revalidation ISR : la page publique est mise en cache et rafraichie.
export const revalidate = 60;

async function getWedding(slug: string) {
  const wedding = await db.wedding.findUnique({
    where: { slug },
    include: {
      template: true,
      events: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!wedding || wedding.status !== "PUBLISHED") return null;
  return wedding;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) return { title: "Invitation introuvable" };

  const title = `${wedding.partnerOne} & ${wedding.partnerTwo} — Notre mariage`;
  const description =
    wedding.seoDescription ??
    wedding.message ??
    `${wedding.partnerOne} & ${wedding.partnerTwo} vous invitent a celebrer leur mariage.`;
  const cover =
    wedding.photos.find((p) => p.isCover)?.url ??
    wedding.photos[0]?.url ??
    wedding.coverImageUrl ??
    undefined;
  const url = absoluteUrl(weddingPath(slug));

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) notFound();

  const publicUrl = absoluteUrl(weddingPath(slug));
  const templateKey = wedding.template?.key ?? "classic";

  // QR code genere cote serveur (data URL PNG)
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 512,
    margin: 1,
    color: { dark: "#111111", light: "#ffffff" },
  });

  const data: PublicWedding = {
    id: wedding.id,
    slug: wedding.slug,
    partnerOne: wedding.partnerOne,
    partnerTwo: wedding.partnerTwo,
    weddingDate: wedding.weddingDate,
    weddingTime: wedding.weddingTime,
    message: wedding.message,
    contactPhone: wedding.contactPhone,
    coverImageUrl: wedding.coverImageUrl,
    templateKey,
    events: wedding.events.map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      venueName: e.venueName,
      address: e.address,
      mapUrl: e.mapUrl,
      startsAt: e.startsAt,
    })),
    photos: wedding.photos.map((p) => ({
      id: p.id,
      url: p.url,
      thumbnailUrl: p.thumbnailUrl,
      isCover: p.isCover,
    })),
  };

  return <WeddingTemplate wedding={data} publicUrl={publicUrl} qrDataUrl={qrDataUrl} />;
}
