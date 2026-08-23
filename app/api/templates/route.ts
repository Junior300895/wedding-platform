import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const templates = await db.weddingTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, key: true, name: true, description: true, minTier: true },
  });
  return NextResponse.json({ templates });
}
