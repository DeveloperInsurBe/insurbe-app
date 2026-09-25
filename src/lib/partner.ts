import { cache } from "react";

import { prisma } from "./prisma";

export const getPartnerByEmail = cache(async (email: string) => {
  if (!email) return null;

  // Same result as `findFirst({ include: { partnerProfile: true } })`, but the user and
  // profile are fetched in parallel instead of two sequential round trips.
  const query = async () => {
    const [user, partnerProfile] = await Promise.all([
      prisma.user.findFirst({
        where: { email, role: "partner" },
      }),
      prisma.partnerProfile.findFirst({
        where: { user: { email, role: "partner" } },
      }),
    ]);

    if (!user) return null;

    return {
      ...user,
      partnerProfile: partnerProfile?.userId === user.id ? partnerProfile : null,
    };
  };

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
