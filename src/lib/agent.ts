import { cache } from "react";

import { prisma } from "./prisma";

export const getAgentByEmail = cache(async (email: string) => {
  if (!email) return null;

  return prisma.user.findFirst({
    where: { email, role: "agent" },
    include: { partnerProfile: true },
  });
});
