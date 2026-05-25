import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // GET ALL PARTNERS
  const partners = await prisma.user.findMany({
    where: {
      role: "partner",
    },
  });

  console.log(`Found ${partners.length} partners`);

  for (const partner of partners) {
    // SKIP IF NO PARTNER ID
    if (!partner.id) continue;

    await prisma.partnerProfile.upsert({
      where: {
        userId: partner.id,
      },

      update: {},

      create: {
        userId: partner.id,

        companyName: partner.companyName,
        title: partner.title,
        firstName: partner.firstName,
        lastName: partner.lastName,

        email: partner.email,
      },
    });

    console.log(`Migrated: ${partner.email}`);
  }

  console.log("Migration completed");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });