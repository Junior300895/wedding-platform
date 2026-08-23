"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function toggleTemplateAction(templateId: string) {
  await requireAdmin();
  const t = await db.weddingTemplate.findUnique({ where: { id: templateId } });
  if (!t) return;
  await db.weddingTemplate.update({
    where: { id: templateId },
    data: { isActive: !t.isActive },
  });
  revalidatePath("/admin/templates");
}
