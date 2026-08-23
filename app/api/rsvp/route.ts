import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rsvpSchema } from "@/lib/validations/rsvp";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Donnees invalides" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const wedding = await db.wedding.findUnique({
    where: { id: data.weddingId },
    select: { status: true },
  });
  if (!wedding || wedding.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Invitation indisponible" }, { status: 404 });
  }

  const guest = await db.guest.create({
    data: {
      weddingId: data.weddingId,
      name: data.name,
      phone: data.phone || null,
      response: data.response,
      partySize: data.partySize,
      message: data.message || null,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: guest.id }, { status: 201 });
}
