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
      agentId: true,
    },
  });

  // Agents, so a record can be linked to the agent who brought the customer.
  const agents = await prisma.user.findMany({
    where: { role: "agent" },
    orderBy: [{ firstName: "asc" }, { email: "asc" }],
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  return (
    <MawsitaClient
      initialRows={rows}
      agents={agents.map((agent) => ({
        id: agent.id,
        name: [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim() || agent.email,
      }))}
    />
  );
}
