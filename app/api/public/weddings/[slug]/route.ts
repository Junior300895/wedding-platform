import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const wedding = await db.wedding.findUnique({
    where: { slug },
    include: {
      template: { select: { key: true, name: true } },
      events: { orderBy: { sortOrder: "asc" } },
      photos: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, thumbnailUrl: true, isCover: true },
      },
    },
  });

  if (!wedding || wedding.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // On ne renvoie que les donnees publiques
  return NextResponse.json({
    slug: wedding.slug,
    partnerOne: wedding.partnerOne,
    partnerTwo: wedding.partnerTwo,
    weddingDate: wedding.weddingDate,
    weddingTime: wedding.weddingTime,
    message: wedding.message,
    template: wedding.template,
    events: wedding.events,
    photos: wedding.photos,
  });
}
