import { prisma } from "../src/lib/prisma";

async function main() {
  const rows = await prisma.mawsitaRecord.findMany({
    where: { userId: null },
    select: { id: true, email: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const email = String(row.email || "").trim().toLowerCase();
    if (!email) {
      skipped += 1;
      continue;
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (!user?.id) {
      skipped += 1;
      continue;
    }

    await prisma.mawsitaRecord.update({
      where: { id: row.id },
      data: { userId: user.id, email },
      select: { id: true },
    });
    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        scanned: rows.length,
        updated,
        skipped,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
