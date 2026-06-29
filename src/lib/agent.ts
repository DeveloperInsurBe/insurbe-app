import { cache } from "react";

import { prisma } from "./prisma";

export const getAgentByEmail = cache(async (email: string) => {
  if (!email) return null;

  const query = () =>
    prisma.user.findFirst({
      where: { email, role: "agent" },
      include: { partnerProfile: true },
    });

  try {
    return await query();
  } catch (error: any) {
    if (error?.code === "P2024") {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return query();
    }
    throw error;
  }
});
