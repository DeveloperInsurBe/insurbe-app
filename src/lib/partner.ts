import { cache } from "react";

import { prisma } from "./prisma";

export const getPartnerByEmail = cache(async (email: string) => {
  if (!email) return null;

  return prisma.user.findFirst({
    where: { email, role: "partner" },
    include: { partnerProfile: true },
  });
});
