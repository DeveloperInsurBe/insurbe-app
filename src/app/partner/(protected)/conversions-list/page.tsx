import { redirect } from "next/navigation";

import ConversionsClient from "./ConversionsClient";
import { getCurrentPartnerAccess } from "@/lib/applicationAccess";
import { prisma } from "@/lib/prisma";

export default async function ConversionsPage() {
  const { session, partner } = await getCurrentPartnerAccess();

  if (!session?.user?.email) {
    redirect("/");
  }

  if (!partner?.partnerId) {
    redirect("/");
  }

  const applications = await prisma.application.findMany({
    where: {
      partnerId: partner.partnerId,
      source: "partner",
      status: {
        not: "incomplete",
      },
    },
    select: {
      id: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      product: true,
      userId: true,
      partnerId: true,
      commission: true,
      commissionStatus: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedApplications = applications.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <ConversionsClient
      initialData={serializedApplications}
      partnerRef={partner.partnerId}
    />
  );
}
