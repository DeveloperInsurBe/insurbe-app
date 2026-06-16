import { cache } from "react";

import { prisma } from "./prisma";

export const getAgentByEmail = cache(async (email: string) => {
  if (!email) return null;

  return prisma.user.findUnique({
    where: { email },
    include: { partnerProfile: true },
  });
});
