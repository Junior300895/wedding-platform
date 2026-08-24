"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteWeddingCascade } from "@/lib/wedding-delete";
import { ensureUniqueWeddingSlug } from "@/lib/slug";
import { generateTempPassword } from "@/lib/temp-password";
import { adminWeddingSchema, newClientSchema } from "@/lib/validations/admin";
import { buildWeddingSlug } from "@/lib/utils";

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

type ActionState = { error?: string; success?: boolean };

/**
 * Change l'offre d'un mariage. Reserve a l'administration : c'est le seul
 * endroit ou planTier est modifiable tant que le paiement en ligne n'est
 * pas branche (webhook encore a l'etat de squelette).
 */
export async function updateWeddingPlanAction(
  weddingId: string,
  planTier: "ESSENTIEL" | "PREMIUM" | "PRESTIGE"
) {
  await requireAdmin();
  await db.wedding.update({
    where: { id: weddingId },
    data: { planTier },
  });
  revalidatePath(`/dashboard/mariage/${weddingId}`);
  revalidatePath("/admin/weddings");
}

type CreateState = {
  error?: string;
  success?: boolean;
  weddingId?: string;
  /** Renseigne uniquement quand un compte vient d'etre cree. */
  newAccount?: { email: string; tempPassword: string };
};

/**
 * Cree un mariage au nom d'un client, depuis l'administration.
 *
 * Deux modes : rattacher a un client existant, ou creer son compte au
 * passage. Dans le second cas le mot de passe est genere cote serveur et
 * renvoye une seule fois pour affichage ; seul son hash est stocke.
 *
 * Le compte et le mariage sont crees dans une meme transaction : un echec
 * sur le mariage ne laisse pas un compte orphelin derriere lui.
 */
export async function createWeddingForClientAction(
  _prev: CreateState,
  formData: FormData
): Promise<CreateState> {
  await requireAdmin();

  const mode = String(formData.get("clientMode") ?? "existing");

  const parsedWedding = adminWeddingSchema.safeParse({
    partnerOne: formData.get("partnerOne"),
    partnerTwo: formData.get("partnerTwo"),
    weddingDate: formData.get("weddingDate"),
    weddingTime: formData.get("weddingTime") ?? "",
    message: formData.get("message") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    templateId: formData.get("templateId") ?? "",
    planTier: formData.get("planTier") ?? "ESSENTIEL",
    slug:
      String(formData.get("slug") ?? "") ||
      buildWeddingSlug(
        String(formData.get("partnerOne") ?? ""),
        String(formData.get("partnerTwo") ?? "")
      ),
  });

  if (!parsedWedding.success) {
    return { error: parsedWedding.error.errors[0]?.message ?? "Donnees invalides" };
  }
  const w = parsedWedding.data;

  // --- Resolution du client ------------------------------------------------
  let userId: string;
  let newAccount: CreateState["newAccount"];
  let passwordHash: string | null = null;
  let clientData: { name: string; email: string; phone: string } | null = null;

  if (mode === "new") {
    const parsedClient = newClientSchema.safeParse({
      name: formData.get("clientName"),
      email: formData.get("clientEmail"),
      phone: formData.get("clientPhone") ?? "",
    });
    if (!parsedClient.success) {
      return { error: parsedClient.error.errors[0]?.message ?? "Client invalide" };
    }
    const c = parsedClient.data;
    const email = c.email.trim().toLowerCase();

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: `Un compte existe deja avec ${email}.` };
    }

    const tempPassword = generateTempPassword();
    passwordHash = await bcrypt.hash(tempPassword, 10);
    clientData = { name: c.name, email, phone: c.phone ?? "" };
    newAccount = { email, tempPassword };
    userId = ""; // attribue dans la transaction
  } else {
    const selected = String(formData.get("userId") ?? "");
    if (!selected) return { error: "Choisissez un client." };
    const user = await db.user.findUnique({
      where: { id: selected },
      select: { id: true },
    });
    if (!user) return { error: "Ce client n'existe plus." };
    userId = user.id;
  }

  const slug = await ensureUniqueWeddingSlug(w.slug);

  // --- Ecriture ------------------------------------------------------------
  const weddingId = await db.$transaction(async (tx) => {
    let ownerId = userId;

    if (clientData && passwordHash) {
      const created = await tx.user.create({
        data: {
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone || null,
          passwordHash,
        },
        select: { id: true },
      });
      ownerId = created.id;
    }

    const wedding = await tx.wedding.create({
      data: {
        slug,
        partnerOne: w.partnerOne,
        partnerTwo: w.partnerTwo,
        weddingDate: w.weddingDate,
        weddingTime: w.weddingTime || null,
        message: w.message || null,
        contactPhone: w.contactPhone || null,
        templateId: w.templateId || null,
        planTier: w.planTier,
        userId: ownerId,
      },
      select: { id: true },
    });

    return wedding.id;
  });

  revalidatePath("/admin/weddings");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return { success: true, weddingId, newAccount };
}

/**
 * Suppression d'un mariage depuis l'administration.
 *
 * Irreversible : la confirmation par saisie du lien est exigee cote client,
 * et revalidee ici pour qu'un appel direct a l'action ne puisse pas la
 * contourner.
 */
export async function deleteWeddingAdminAction(
  weddingId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const wedding = await db.wedding.findUnique({
    where: { id: weddingId },
    select: { slug: true },
  });
  if (!wedding) return { error: "Ce mariage n'existe plus." };

  const typed = String(formData.get("confirmSlug") ?? "").trim();
  if (typed !== wedding.slug) {
    return { error: "Le lien saisi ne correspond pas. Suppression annulee." };
  }

  await deleteWeddingCascade(weddingId);

  revalidatePath("/admin/weddings");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath(`/mariage/${wedding.slug}`);

  return { success: true };
}
