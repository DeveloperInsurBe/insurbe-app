import { redirect } from "next/navigation";

import ConversionsClient from "./ConversionsClient";
import { getCurrentPartnerAccess } from "@/lib/applicationAccess";
import { prisma } from "@/lib/prisma";

type SearchParamsInput =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

type ConversionsPageProps = {
  searchParams?: SearchParamsInput;
};

const PAGE_SIZE = 20;
const ALLOWED_PAGE_SIZES = new Set([20, 50, 100]);

function readPositiveInt(value: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function readPageSize(value: string | string[] | undefined) {
  const parsed = readPositiveInt(value, PAGE_SIZE);
  if (!ALLOWED_PAGE_SIZES.has(parsed)) return PAGE_SIZE;
  return parsed;
}

export default async function ConversionsPage({ searchParams }: ConversionsPageProps) {
  const { session, partner } = await getCurrentPartnerAccess();

  if (!session?.user?.email) {
    redirect("/");
  }

  if (!partner?.partnerId) {
    redirect("/");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedPage = readPositiveInt(resolvedSearchParams.page, 1);
  const pageSize = readPageSize(resolvedSearchParams.pageSize);

  const baseWhere = {
    partnerId: partner.partnerId,
    source: "partner",
    status: {
      not: "incomplete",
    },
  } as const;

  const totalCount = await prisma.application.count({
    where: baseWhere,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const applications = await prisma.application.findMany({
    where: baseWhere,
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
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
  });

  const serializedApplications = applications.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <ConversionsClient
      initialData={serializedApplications}
      partnerRef={partner.partnerId}
      page={page}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
    />
  );
}
