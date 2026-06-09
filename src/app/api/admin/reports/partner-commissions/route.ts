import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

type ReportRow = {
  partnerId: string;
  partnerName: string;
  companyName: string;
  partnerEmail: string;
  totalApplications: number;
  totalCommission: number;
  pendingCommission: number;
  approvedCommission: number;
  paidCommission: number;
  rejectedCommission: number;
  notEligibleCommission: number;
  payableCommission: number;
};

function parseDate(input: string | null): Date | null {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultTo = new Date(now);

    const fromDate = parseDate(fromParam) ?? defaultFrom;
    const toDate = parseDate(toParam) ?? defaultTo;

    const fromStart = new Date(fromDate);
    fromStart.setHours(0, 0, 0, 0);

    const toEndExclusive = new Date(toDate);
    toEndExclusive.setHours(0, 0, 0, 0);
    toEndExclusive.setDate(toEndExclusive.getDate() + 1);

    const grouped = await prisma.application.groupBy({
      by: ["partnerId", "commissionStatus"],
      where: {
        source: "partner",
        partnerId: { not: null },
        createdAt: {
          gte: fromStart,
          lt: toEndExclusive,
        },
      },
      _count: { _all: true },
      _sum: { commission: true },
    });

    const partnerIds = Array.from(
      new Set(grouped.map((item) => item.partnerId).filter(Boolean)),
    ) as string[];

    const partners = await prisma.user.findMany({
      where: {
        role: "partner",
        partnerId: { in: partnerIds },
      },
      select: {
        partnerId: true,
        firstName: true,
        lastName: true,
        companyName: true,
        email: true,
      },
    });

    const partnerInfoMap = new Map(
      partners.map((partner) => [
        partner.partnerId,
        {
          partnerName: `${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim(),
          companyName: partner.companyName || "",
          partnerEmail: partner.email,
        },
      ]),
    );

    const rowsMap = new Map<string, ReportRow>();

    for (const item of grouped) {
      const partnerId = item.partnerId || "";
      if (!partnerId) continue;

      if (!rowsMap.has(partnerId)) {
        const info = partnerInfoMap.get(partnerId);
        rowsMap.set(partnerId, {
          partnerId,
          partnerName: info?.partnerName || "",
          companyName: info?.companyName || "",
          partnerEmail: info?.partnerEmail || "",
          totalApplications: 0,
          totalCommission: 0,
          pendingCommission: 0,
          approvedCommission: 0,
          paidCommission: 0,
          rejectedCommission: 0,
          notEligibleCommission: 0,
          payableCommission: 0,
        });
      }

      const row = rowsMap.get(partnerId)!;
      const commissionSum = item._sum.commission ?? 0;
      const status = item.commissionStatus || "";

      row.totalApplications += item._count._all;
      row.totalCommission += commissionSum;

      if (status === "Pending") row.pendingCommission += commissionSum;
      if (status === "Approved") {
        row.approvedCommission += commissionSum;
        row.payableCommission += commissionSum;
      }
      if (status === "Paid") row.paidCommission += commissionSum;
      if (status === "Rejected") row.rejectedCommission += commissionSum;
      if (status === "Not Eligible") row.notEligibleCommission += commissionSum;
    }

    const rows = Array.from(rowsMap.values()).sort(
      (a, b) => b.payableCommission - a.payableCommission,
    );

    const summary = rows.reduce(
      (acc, row) => {
        acc.totalPartners += 1;
        acc.totalApplications += row.totalApplications;
        acc.totalCommission += row.totalCommission;
        acc.totalPending += row.pendingCommission;
        acc.totalApproved += row.approvedCommission;
        acc.totalPaid += row.paidCommission;
        acc.totalPayable += row.payableCommission;
        return acc;
      },
      {
        totalPartners: 0,
        totalApplications: 0,
        totalCommission: 0,
        totalPending: 0,
        totalApproved: 0,
        totalPaid: 0,
        totalPayable: 0,
      },
    );

    return NextResponse.json({
      from: fromStart.toISOString(),
      to: new Date(toEndExclusive.getTime() - 1).toISOString(),
      summary,
      rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate partner commission report" },
      { status: 500 },
    );
  }
}
