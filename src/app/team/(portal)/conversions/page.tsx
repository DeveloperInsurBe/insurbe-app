import { redirect } from "next/navigation";

import ConversionsClient from "@/app/partner/(protected)/conversions-list/ConversionsClient";
import { prisma } from "@/lib/prisma";
import { getCurrentTeamAdmin } from "@/lib/team/access";
import { directCustomersWhere } from "@/lib/team/data";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const ALLOWED_PAGE_SIZES = new Set([20, 50, 100]);

function readPositiveInt(value: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * The Sales Leader's own conversions (direct customers), in the same view
 * partners have. Partners' customers are on the Customers page.
 */
export default async function TeamConversionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const teamAdmin = await getCurrentTeamAdmin();
  if (!teamAdmin) redirect("/team/login");

  const params = await searchParams;
  const requestedPage = readPositiveInt(params.page, 1);
  const requestedSize = readPositiveInt(params.pageSize, PAGE_SIZE);
  const pageSize = ALLOWED_PAGE_SIZES.has(requestedSize) ? requestedSize : PAGE_SIZE;

  const where = { AND: [directCustomersWhere(teamAdmin.id), { status: { not: "incomplete" } }] };
  const totalCount = await prisma.application.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const applications = await prisma.application.findMany({
    where,
    select: {
      id: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      product: true,
      userId: true,
      partnerId: true,
      commission: true,
      commissionStatus: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <ConversionsClient
      initialData={applications.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))}
      partnerRef={teamAdmin.id}
      page={page}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
    />
  );
}
