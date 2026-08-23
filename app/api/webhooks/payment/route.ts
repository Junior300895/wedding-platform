import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Webhook de paiement (Wave / Orange Money / Stripe...).
 * Squelette conforme a la doc (sec. 17) : verifier la signature,
 * mettre a jour Order/Payment, puis activer le mariage.
 *
 * A COMPLETER selon le prestataire de paiement retenu.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PAYMENT_SECRET;
  const signature = req.headers.get("x-payment-signature");

  // TODO: verifier la signature du prestataire avant de faire confiance au payload
  if (secret && signature !== secret) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload?.orderId) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const success = payload.status === "SUCCESS";

  await db.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: payload.orderId },
      data: { status: success ? "PAID" : "CANCELLED" },
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: payload.provider ?? "unknown",
        providerRef: payload.reference ?? null,
        amount: order.amount,
        currency: order.currency,
        status: success ? "SUCCESS" : "FAILED",
        rawPayload: payload,
      },
    });

    if (success && order.weddingId) {
      await tx.wedding.update({
        where: { id: order.weddingId },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
    }
  });

  return NextResponse.json({ received: true });
}
