import { getDefaultCommissionRate } from "./commission";
import { prisma } from "./prisma";

type ReferralSource = "user" | "partner" | "agent";

type ReferralAttribution = {
  source: ReferralSource;
  partnerId: string | null;
  isAttributed: boolean;
  /** Commission in whole EUR for this referrer (0 when not attributed) */
  commission: number;
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
      commission: 0,
    };
  }

  const partnerUser = await prisma.user.findFirst({
    where: {
      role: "partner",
      partnerId: ref,
    },
    select: {
      partnerId: true,
      commissionRate: true,
    },
  });

  if (partnerUser?.partnerId) {
    return {
      source: "partner",
      partnerId: partnerUser.partnerId,
      isAttributed: true,
      commission:
        partnerUser.commissionRate ??
        (await getDefaultCommissionRate("partner")),
    };
  }

  const agentUser = await prisma.user.findFirst({
    where: {
      role: "agent",
      id: ref,
    },
    select: {
      id: true,
      commissionRate: true,
    },
  });

  if (agentUser?.id) {
    return {
      source: "agent",
      partnerId: agentUser.id,
      isAttributed: true,
      commission:
        agentUser.commissionRate ?? (await getDefaultCommissionRate("agent")),
    };
  }

  return {
    source: "user",
    partnerId: null,
    isAttributed: false,
    commission: 0,
  };
}
