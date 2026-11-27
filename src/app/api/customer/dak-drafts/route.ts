import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { DRAFT_STATUS_LABELS, dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { OPEN_DRAFT_STATUSES } from "@/lib/dak/bulk/draftServer";
import { prisma } from "@/lib/prisma";

/** The signed-in customer's open DAK drafts (prepared by a partner), for the dashboard. */
export async function GET() {
  if (!dakBulkUploadEnabled()) return NextResponse.json({ drafts: [] });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ drafts: [] }, { status: 401 });

  const drafts = await prisma.dakDraft.findMany({
    where: { customerUserId: session.user.id, status: { in: [...OPEN_DRAFT_STATUSES, "submitting"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, reference: true, status: true, partnerUserId: true, createdAt: true },
  });
  const partners = await prisma.user.findMany({
    where: { id: { in: drafts.map((draft) => draft.partnerUserId) } },
    select: { id: true, companyName: true, firstName: true, lastName: true },
  });
  return NextResponse.json({
    drafts: drafts.map((draft) => {
      const partner = partners.find((item) => item.id === draft.partnerUserId);
      return {
        id: draft.id,
        reference: draft.reference,
        status: draft.status,
        statusLabel: DRAFT_STATUS_LABELS[draft.status] ?? draft.status,
        partnerName: partner?.companyName || [partner?.firstName, partner?.lastName].filter(Boolean).join(" ") || "An InsurBe partner",
        createdAt: draft.createdAt.toISOString(),
      };
    }),
  });
}
