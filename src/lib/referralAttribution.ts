import { prisma } from "./prisma";

type ReferralSource = "user" | "partner" | "agent";

type ReferralAttribution = {
  source: ReferralSource;
  partnerId: string | null;
  isAttributed: boolean;
};

export async function resolveReferralAttribution(
  rawRef: string | null | undefined,
): Promise<ReferralAttribution> {
  const ref = String(rawRef || "").trim();

  if (!ref) {
    return {
      source: "user",
      partnerId: null,
      isAttributed: false,
    };
  }

  const partnerUser = await prisma.user.findFirst({
    where: {
      role: "partner",
      partnerId: ref,
    },
    select: {
      partnerId: true,
    },
  });

  if (partnerUser?.partnerId) {
    return {
      source: "partner",
      partnerId: partnerUser.partnerId,
      isAttributed: true,
    };
  }

  const agentUser = await prisma.user.findFirst({
    where: {
      role: "agent",
      id: ref,
    },
    select: {
      id: true,
    },
  });

  if (agentUser?.id) {
    return {
      source: "agent",
      partnerId: agentUser.id,
      isAttributed: true,
    };
  }

  return {
    source: "user",
    partnerId: null,
    isAttributed: false,
  };
}
