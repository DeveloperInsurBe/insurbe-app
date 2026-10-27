import { DAK_REVIEWER_DISABLED_ROLE, DAK_REVIEWER_ROLE, reviewerDisplayName } from "@/lib/dak/access";
import { prisma } from "@/lib/prisma";
import { DakHeader, openTicketCount } from "../shared";
import ReviewersClient, { type ReviewerRow } from "./ReviewersClient";

export const dynamic = "force-dynamic";

export default async function AdminDakReviewersPage() {
  const [users, activity, tickets] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: [DAK_REVIEWER_ROLE, DAK_REVIEWER_DISABLED_ROLE] } },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, createdAt: true },
    }),
    prisma.dakEvent.groupBy({
      by: ["actorId"],
      where: { actorType: "reviewer", actorId: { not: null } },
      _count: { _all: true },
      _max: { createdAt: true },
    }),
    openTicketCount(),
  ]);

  const byReviewer = new Map(activity.map((row) => [row.actorId, row]));

  const reviewers: ReviewerRow[] = users.map((user) => ({
    id: user.id,
    name: reviewerDisplayName(user),
    email: user.email,
    active: user.role === DAK_REVIEWER_ROLE,
    createdAt: user.createdAt.toISOString(),
    actions: byReviewer.get(user.id)?._count._all ?? 0,
    lastActionAt: byReviewer.get(user.id)?._max.createdAt?.toISOString() ?? null,
  }));

  return (
    <div className="min-w-0 space-y-4">
      <DakHeader
        active="reviewers"
        title="DAK reviewers"
        subtitle="Accounts DAK employees use to sign in to the DAK Provider Portal."
        badges={{ support: tickets }}
      />
      <ReviewersClient reviewers={reviewers} />
    </div>
  );
}
