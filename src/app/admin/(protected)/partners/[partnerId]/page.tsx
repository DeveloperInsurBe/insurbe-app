import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import CommissionRateCard from "../../CommissionRateCard";
import {
  PERIODS,
  PUBLIC_PROVIDERS,
  customerKey,
  parsePeriod,
  periodHref,
  periodRange,
} from "../publicInsurance";

const TABS = [
  { value: "all", label: "All" },
  { value: "tk", label: "TK" },
  { value: "dak", label: "DAK" },
] as const;

type Tab = (typeof TABS)[number]["value"];

function statusClass(status: string) {
  if (status === "FAILED") return "bg-red-50 text-red-700 border-red-200";
  if (status === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export default async function AdminPartnerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ partnerId: string }>;
  searchParams: Promise<{ period?: string; provider?: string }>;
}) {
  const { partnerId: rawPartnerId } = await params;
  const partnerId = decodeURIComponent(rawPartnerId);
  const query = await searchParams;
  const period = parsePeriod(query.period);
  const range = periodRange(period);
  const tab: Tab = TABS.some((item) => item.value === query.provider)
    ? (query.provider as Tab)
    : "all";

  const partner = await prisma.user.findFirst({
    where: { role: "partner", partnerId },
    select: {
      id: true,
      partnerId: true,
      firstName: true,
      lastName: true,
      email: true,
      companyName: true,
      commissionRate: true,
    },
  });

  if (!partner) notFound();

  const applications = await prisma.insuranceApplication.findMany({
    where: {
      partnerId,
      source: "partner",
      provider: { in: [...PUBLIC_PROVIDERS] },
      ...(range ? { createdAt: range } : {}),
    },
    select: {
      id: true,
      applicationNumber: true,
      provider: true,
      status: true,
      createdAt: true,
      payload: true,
    },
    orderBy: { createdAt: "asc" },
  });

  /**
   * UNIQUE CUSTOMER + PROVIDER; LATER SUBMISSIONS ARE REPEATS
   */
  const seen = new Set<string>();
  const uniqueCounts = { TK: 0, DAK: 0 } as Record<string, number>;

  const rows = applications.map((app) => {
    const key = `${app.provider}:${customerKey(app.payload, app.id)}`;
    const isRepeat = seen.has(key);

    if (!isRepeat) {
      seen.add(key);
      uniqueCounts[app.provider] = (uniqueCounts[app.provider] ?? 0) + 1;
    }

    const personal =
      (app.payload as {
        personal?: { firstName?: string; lastName?: string; email?: string };
      } | null)?.personal ?? {};

    return {
      id: app.id,
      applicationId: app.applicationNumber || app.id,
      provider: app.provider,
      status: app.status,
      createdAt: app.createdAt,
      customer:
        `${personal.firstName ?? ""} ${personal.lastName ?? ""}`.trim() || "-",
      email: personal.email || "-",
      isRepeat,
    };
  });

  const visibleRows = rows
    .filter((row) => tab === "all" || row.provider.toLowerCase() === tab)
    .reverse();

  const tabCounts: Record<Tab, number> = {
    all: (uniqueCounts.TK ?? 0) + (uniqueCounts.DAK ?? 0),
    tk: uniqueCounts.TK ?? 0,
    dak: uniqueCounts.DAK ?? 0,
  };

  const basePath = `/admin/partners/${encodeURIComponent(partnerId)}`;
  const fullName =
    `${partner.firstName ?? ""} ${partner.lastName ?? ""}`.trim() || "Partner";

  return (
    <div className="min-w-0 space-y-5">
      <Link
        href={periodHref("/admin/partners", { period })}
        className="inline-block text-sm font-semibold text-[#820ad1] hover:underline"
      >
        ← All partners
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Partner · {partner.partnerId}
        </p>
        <h1 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
          {fullName}
        </h1>
        <p className="mt-2 break-all text-sm text-gray-500">
          {[partner.companyName, partner.email].filter(Boolean).join(" · ")}
        </p>
      </div>

      {partner.partnerId ? (
        <CommissionRateCard
          role="partner"
          userId={partner.id}
          referrerKey={partner.partnerId}
          name={fullName}
          commissionRate={partner.commissionRate}
        />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((item) => (
            <Link
              key={item.value}
              href={periodHref(basePath, { period, provider: item.value })}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                tab === item.value
                  ? "bg-[#820ad1] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label} ({tabCounts[item.value]})
            </Link>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {PERIODS.map((item) => (
            <Link
              key={item.value}
              href={periodHref(basePath, { period: item.value, provider: tab })}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                period === item.value
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Counts are unique customers per provider. The list shows every
        submission; repeats of the same customer are marked.
      </p>

      {visibleRows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No submissions for this period.
        </div>
      ) : (
        <>
          <div className="space-y-3 xl:hidden">
            {visibleRows.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {row.customer}
                    </p>
                    <p className="mt-1 break-all text-xs text-gray-500">
                      {row.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-600">
                  <span className="font-semibold">{row.provider}</span> ·{" "}
                  {row.applicationId}
                  {row.isRepeat ? " · Repeat" : ""}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {row.createdAt ? row.createdAt.toLocaleString() : "-"}
                </p>
              </div>
            ))}
          </div>

          <div className="hidden max-w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white xl:block">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  {["Application ID", "Provider", "Customer", "Email", "Submitted", "Status"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {row.applicationId}
                      {row.isRepeat ? (
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                          Repeat
                        </span>
                      ) : null}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-semibold ${
                        row.provider === "TK" ? "text-blue-600" : "text-emerald-600"
                      }`}
                    >
                      {row.provider}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row.customer}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.createdAt ? row.createdAt.toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
