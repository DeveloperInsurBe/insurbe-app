import { prisma } from "@/lib/prisma";

import MawsitaClient from "./MawsitaClient";

export default async function AdminMawsitaPage() {
  const rows = await prisma.mawsitaRecord.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      customerName: true,
      email: true,
      phone: true,
      planName: true,
      planType: true,
      startDate: true,
      endDate: true,
      premiumAmount: true,
      status: true,
      notes: true,
      documents: true,
      createdByEmail: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return <MawsitaClient initialRows={rows} />;
}
