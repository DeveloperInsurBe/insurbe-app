"use client";

import { useEffect, useMemo, useState } from "react";

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

type ReportResponse = {
  from: string;
  to: string;
  summary: {
    totalPartners: number;
    totalApplications: number;
    totalCommission: number;
    totalPending: number;
    totalApproved: number;
    totalPaid: number;
    totalPayable: number;
  };
  rows: ReportRow[];
};

function toDateInputString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ReportsClient() {
  const [from, setFrom] = useState(() => {
    const now = new Date();
    return toDateInputString(new Date(now.getFullYear(), now.getMonth(), 1));
  });
  const [to, setTo] = useState(() => toDateInputString(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ReportResponse | null>(null);
  const [query, setQuery] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ from, to });
      const res = await fetch(
        `/api/admin/reports/partner-commissions?${params.toString()}`,
        { cache: "no-store" },
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to load report");
      }
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Could not load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.rows;

    return data.rows.filter((row) => {
      const line = [
        row.partnerId,
        row.partnerName,
        row.companyName,
        row.partnerEmail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return line.includes(q);
    });
  }, [data, query]);

  const exportCsv = () => {
    if (!filteredRows.length) return;

    const headers = [
      "Partner ID",
      "Partner Name",
      "Company",
      "Email",
      "Applications",
      "Total Commission",
      "Pending Commission",
      "Approved Commission",
      "Paid Commission",
      "Rejected Commission",
      "Not Eligible Commission",
      "Payable Commission",
    ];

    const escape = (val: string | number) =>
      `"${String(val ?? "").replaceAll('"', '""')}"`;

    const lines = filteredRows.map((row) =>
      [
        row.partnerId,
        row.partnerName,
        row.companyName,
        row.partnerEmail,
        row.totalApplications,
        row.totalCommission,
        row.pendingCommission,
        row.approvedCommission,
        row.paidCommission,
        row.rejectedCommission,
        row.notEligibleCommission,
        row.payableCommission,
      ]
        .map(escape)
        .join(","),
    );

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `partner-commission-report-${from}-to-${to}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
          Reports
        </p>
        <h1 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
          Monthly Commission Report
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Date-range report with partner-wise payable totals.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Search Partner
            </label>
            <input
              type="text"
              placeholder="Partner ID, name, company..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="h-10 flex-1 rounded-lg bg-[#820ad1] px-3 text-sm font-semibold text-white hover:bg-[#6f08b2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Apply"}
            </button>
            <button
              onClick={exportCsv}
              className="h-10 rounded-lg border border-[#820ad1]/20 bg-[#820ad1]/5 px-3 text-sm font-semibold text-[#820ad1] hover:bg-[#820ad1]/10"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {data ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="Partners" value={data.summary.totalPartners} />
          <SummaryCard label="Applications" value={data.summary.totalApplications} />
          <SummaryCard label="Total Commission" value={`EUR ${data.summary.totalCommission}`} />
          <SummaryCard label="Payable" value={`EUR ${data.summary.totalPayable}`} />
        </div>
      ) : null}

      <div className="space-y-3 xl:hidden">
        {filteredRows.map((row) => (
          <div key={row.partnerId} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {row.partnerName || row.partnerId}
                </p>
                <p className="mt-1 text-xs font-medium text-[#820ad1]">
                  {row.partnerId}
                </p>
              </div>
              <p className="text-sm font-black text-[#820ad1]">
                EUR {row.payableCommission}
              </p>
            </div>

            <div className="mt-3 space-y-1 text-sm text-gray-700">
              <p>{row.companyName || "-"}</p>
              <p className="break-all">{row.partnerEmail || "-"}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MetricChip label="Apps" value={row.totalApplications} />
              <MetricChip label="Total" value={`EUR ${row.totalCommission}`} />
              <MetricChip label="Pending" value={`EUR ${row.pendingCommission}`} />
              <MetricChip label="Approved" value={`EUR ${row.approvedCommission}`} />
              <MetricChip label="Paid" value={`EUR ${row.paidCommission}`} />
              <MetricChip label="Rejected" value={`EUR ${row.rejectedCommission}`} />
            </div>
          </div>
        ))}

        {!loading && filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            No partners found for selected filters.
          </div>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white xl:block">
        <table className="w-full min-w-[1400px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Partner
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Applications
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Pending
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Approved
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Paid
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Rejected
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Not Eligible
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Payable
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.partnerId} className="border-t border-gray-100">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {row.partnerName || row.partnerId}
                  <div className="text-xs font-medium text-[#820ad1]">{row.partnerId}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {row.companyName || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {row.partnerEmail || "-"}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {row.totalApplications}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  EUR {row.totalCommission}
                </td>
                <td className="px-4 py-3 text-sm text-amber-600">
                  EUR {row.pendingCommission}
                </td>
                <td className="px-4 py-3 text-sm text-blue-700">
                  EUR {row.approvedCommission}
                </td>
                <td className="px-4 py-3 text-sm text-emerald-700">
                  EUR {row.paidCommission}
                </td>
                <td className="px-4 py-3 text-sm text-red-600">
                  EUR {row.rejectedCommission}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  EUR {row.notEligibleCommission}
                </td>
                <td className="px-4 py-3 text-sm font-black text-[#820ad1]">
                  EUR {row.payableCommission}
                </td>
              </tr>
            ))}
            {!loading && filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No partners found for selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-black text-gray-900 sm:text-2xl">{value}</p>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-gray-50 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-gray-900">{value}</p>
    </div>
  );
}
