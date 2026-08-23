import { PrismaClient, PlanTier, WeddingStatus, EventType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const templates = [
  { key: "classic", name: "Classic", description: "Elegant et intemporel", style: "Serif, tons neutres, mise en page centree", minTier: PlanTier.ESSENTIEL, sortOrder: 1 },
  { key: "minimal", name: "Minimal", description: "Epure et moderne", style: "Typographie sans-serif, beaucoup d'espace", minTier: PlanTier.ESSENTIEL, sortOrder: 2 },
  { key: "luxury", name: "Luxury", description: "Premium", style: "Or, noir profond, details raffines", minTier: PlanTier.PREMIUM, sortOrder: 3 },
  { key: "floral", name: "Floral", description: "Romantique", style: "Motifs floraux, tons roses et pastels", minTier: PlanTier.PREMIUM, sortOrder: 4 },
  { key: "tradition", name: "Tradition", description: "Inspire des codes locaux", style: "Motifs traditionnels, couleurs chaudes", minTier: PlanTier.PREMIUM, sortOrder: 5 },
  { key: "oriental", name: "Oriental", description: "Elegant et decoratif", style: "Arabesques, tons emeraude et or", minTier: PlanTier.PRESTIGE, sortOrder: 6 },
];

async function main() {
  console.log("Seeding templates...");
  for (const t of templates) {
    await prisma.weddingTemplate.upsert({
      where: { key: t.key },
      update: t,
      create: t,
    });
  }

  console.log("Seeding demo users...");
  const adminPass = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@wedding.sn" },
    update: {},
    create: {
      email: "admin@wedding.sn",
      name: "Administrateur",
      passwordHash: adminPass,
      role: "ADMIN",
    },
  });

  const customerPass = await bcrypt.hash("demo1234", 10);
  const customer = await prisma.user.upsert({
    where: { email: "demo@wedding.sn" },
    update: {},
    create: {
      email: "demo@wedding.sn",
      name: "Client Demo",
      passwordHash: customerPass,
      role: "CUSTOMER",
    },
  });

  console.log("Seeding sample wedding...");
  const classic = await prisma.weddingTemplate.findUnique({ where: { key: "classic" } });
  const existing = await prisma.wedding.findUnique({ where: { slug: "alioune-fatou" } });
  if (!existing) {
    const wedding = await prisma.wedding.create({
      data: {
        slug: "alioune-fatou",
        partnerOne: "Alioune",
        partnerTwo: "Fatou",
        weddingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // dans 60 jours
        weddingTime: "16:00",
        message:
          "Avec joie et gratitude, nous vous invitons a partager le plus beau jour de notre vie.",
        contactPhone: "+221 77 000 00 00",
        status: WeddingStatus.PUBLISHED,
        planTier: PlanTier.PREMIUM,
        publishedAt: new Date(),
        userId: customer.id,
        templateId: classic?.id,
        seoDescription: "Alioune & Fatou vous invitent a celebrer leur mariage.",
        events: {
          create: [
            {
              type: EventType.CEREMONY,
              title: "Ceremonie religieuse",
              venueName: "Grande Mosquee de Dakar",
              address: "Avenue Malick Sy, Dakar",
              startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
              sortOrder: 1,
            },
            {
              type: EventType.RECEPTION,
              title: "Reception",
              venueName: "Salle des fetes King Fahd Palace",
              address: "Route des Almadies, Dakar",
              startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60 + 1000 * 60 * 60 * 3),
              sortOrder: 2,
            },
          ],
        },
        guests: {
          create: [
            { name: "Moussa Diop", response: "YES", partySize: 2, message: "Felicitations !" },
            { name: "Awa Ndiaye", response: "YES", partySize: 1 },
          ],
        },
      },
    });
    console.log("Sample wedding created:", wedding.slug);
  }

  console.log("Done. Comptes de demo :");
  console.log("  ADMIN    -> admin@wedding.sn / admin1234");
  console.log("  CLIENT   -> demo@wedding.sn  / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
