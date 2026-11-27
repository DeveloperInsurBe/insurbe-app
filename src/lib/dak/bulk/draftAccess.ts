import { getServerSession } from "next-auth";

import { authOptions } from "../../authOptions";
import { prisma } from "../../prisma";
import { type CustomerDraft, OPEN_DRAFT_STATUSES, draftSelect } from "./draftServer";

/** The signed-in customer's own open draft, or null (never someone else's). */
export async function getCustomerDraft(draftId: string): Promise<CustomerDraft | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId || typeof draftId !== "string" || draftId.length > 64) return null;
  return prisma.dakDraft.findFirst({
    where: { id: draftId, customerUserId: userId, status: { in: OPEN_DRAFT_STATUSES } },
    select: draftSelect,
  });
}
