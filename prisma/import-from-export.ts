/**
 * Import ponctuel : recharge l'export PostgreSQL dans la base MySQL.
 *
 *   npx tsx prisma/import-from-export.ts
 *
 * Prerequis : DATABASE_URL pointe vers MySQL et `prisma migrate dev` a cree
 * les tables. Le script refuse d'ecrire dans une base qui contient deja des
 * donnees, pour ne jamais melanger deux jeux de donnees.
 */
import { readFileSync } from "fs";
import { Prisma, PrismaClient } from "@prisma/client";

const EXPORT_FILE = "prisma/data-export/postgres-export.json";
const db = new PrismaClient();

type Row = Record<string, unknown>;

async function main() {
  const data = JSON.parse(readFileSync(EXPORT_FILE, "utf8")) as Record<string, Row[]> & {
    exportedAt: string;
    source: string;
  };
  console.log(`Export du ${data.exportedAt} (${data.source})`);

  // 1. Base cible vide, sinon on s'arrete.
  const existing =
    (await db.user.count()) + (await db.wedding.count()) + (await db.weddingTemplate.count());
  if (existing > 0) {
    throw new Error(
      `La base cible contient deja ${existing} ligne(s). Import annule pour ne rien ecraser.`
    );
  }

  // 2. MySQL compare les emails sans tenir compte de la casse : deux comptes
  //    "Awa@x.sn" et "awa@x.sn", distincts sous PostgreSQL, entreraient ici
  //    en conflit. On le detecte avant d'ecrire quoi que ce soit.
  const seen = new Map<string, string>();
  for (const u of data.users) {
    const key = String(u.email).toLowerCase();
    if (seen.has(key)) {
      throw new Error(`Emails en conflit sous MySQL : "${seen.get(key)}" et "${u.email}".`);
    }
    seen.set(key, String(u.email));
  }

  // 3. Ecriture en une transaction, parents avant enfants.
  await db.$transaction(async (tx) => {
    await tx.user.createMany({ data: data.users as Prisma.UserCreateManyInput[] });
    await tx.weddingTemplate.createMany({
      data: data.weddingTemplates as Prisma.WeddingTemplateCreateManyInput[],
    });
    await tx.wedding.createMany({ data: data.weddings as Prisma.WeddingCreateManyInput[] });
    await tx.weddingEvent.createMany({
      data: data.weddingEvents as Prisma.WeddingEventCreateManyInput[],
    });
    await tx.weddingPhoto.createMany({
      data: data.weddingPhotos as Prisma.WeddingPhotoCreateManyInput[],
    });
    await tx.guest.createMany({ data: data.guests as Prisma.GuestCreateManyInput[] });
    await tx.order.createMany({ data: data.orders as Prisma.OrderCreateManyInput[] });
    await tx.payment.createMany({
      // Un Json nul doit etre passe explicitement a Prisma.
      data: data.payments.map((p) => ({
        ...p,
        rawPayload: p.rawPayload ?? Prisma.DbNull,
      })) as Prisma.PaymentCreateManyInput[],
    });
    await tx.shareEvent.createMany({
      data: data.shareEvents as Prisma.ShareEventCreateManyInput[],
    });
  });

  // 4. Controle : chaque table doit avoir exactement le nombre de lignes exporte.
  const counts: [string, number, number][] = [
    ["users", data.users.length, await db.user.count()],
    ["weddingTemplates", data.weddingTemplates.length, await db.weddingTemplate.count()],
    ["weddings", data.weddings.length, await db.wedding.count()],
    ["weddingEvents", data.weddingEvents.length, await db.weddingEvent.count()],
    ["weddingPhotos", data.weddingPhotos.length, await db.weddingPhoto.count()],
    ["guests", data.guests.length, await db.guest.count()],
    ["orders", data.orders.length, await db.order.count()],
    ["payments", data.payments.length, await db.payment.count()],
    ["shareEvents", data.shareEvents.length, await db.shareEvent.count()],
  ];
  let ok = true;
  for (const [name, expected, actual] of counts) {
    const match = expected === actual;
    ok &&= match;
    console.log(`  ${name.padEnd(17)} ${String(actual).padStart(3)} / ${expected} ${match ? "ok" : "ECART"}`);
  }
  if (!ok) throw new Error("Nombre de lignes different de l'export.");
  console.log("Import termine.");
}

main()
  .catch((error) => {
    console.error("Echec :", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
