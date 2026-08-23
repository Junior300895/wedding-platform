"use server";

import { db } from "@/lib/db";

type Channel = "WHATSAPP" | "LINK" | "QRCODE" | "FACEBOOK" | "OTHER";

/** Enregistre un evenement de partage (analytics). */
export async function trackShareAction(weddingId: string, channel: Channel) {
  try {
    await db.shareEvent.create({ data: { weddingId, channel } });
  } catch {
    // analytics best-effort : ne jamais bloquer l'UX
  }
}
