import { reviewerDisplayName } from "@/lib/dak/access";
import { prisma } from "@/lib/prisma";
import { FilterGroup } from "../../adminUi";
import { periodHref } from "../../partners/publicInsurance";
import { DakHeader } from "../shared";
import SupportClient, { type TicketRow } from "./SupportClient";

export const dynamic = "force-dynamic";

export default async function AdminDakSupportPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show: showParam } = await searchParams;
  const show = showParam === "resolved" || showParam === "all" ? showParam : "open";

  const tickets = await prisma.dakSupportTicket.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  const reviewers = await prisma.user.findMany({
    where: { id: { in: [...new Set(tickets.map((ticket) => ticket.reviewerId))] } },
    select: { id: true, firstName: true, lastName: true },
  });
  const names = new Map(reviewers.map((user) => [user.id, reviewerDisplayName(user)]));

  const open = tickets.filter((ticket) => ticket.status === "open").length;
  const rows: TicketRow[] = tickets
    .filter((ticket) => show === "all" || ticket.status === show)
    .map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status === "resolved" ? "resolved" : "open",
      createdAt: ticket.createdAt.toISOString(),
      reviewerName: names.get(ticket.reviewerId) ?? "DAK Reviewer",
      reviewerEmail: ticket.reviewerEmail,
    }));

  return (
    <div className="min-w-0 space-y-4">
      <DakHeader
        active="support"
        title="DAK support messages"
        subtitle="Questions DAK reviewers sent from the portal's Help & Support page."
        badges={{ support: open }}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <FilterGroup
          label="Show"
          options={[
            { value: "open", label: "Open", count: open, dot: "bg-amber-500" },
            { value: "resolved", label: "Resolved", count: tickets.length - open, dot: "bg-emerald-500" },
            { value: "all", label: "All", count: tickets.length },
          ]}
          active={show}
          hrefFor={(value) => periodHref("/admin/dak/support", { show: value === "open" ? undefined : value })}
        />
      </div>

      <SupportClient tickets={rows} />
    </div>
  );
}
