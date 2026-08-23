import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { storage, validateImage } from "@/lib/storage";

/**
 * Endpoint d'upload alternatif (utile pour un client externe).
 * Le flux principal passe par la Server Action uploadPhotoAction.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const check = validateImage(file);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const stored = await storage.upload(file, `users/${user.id}`);
  return NextResponse.json(stored, { status: 201 });
}
