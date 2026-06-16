"use client";

import { useMemo, useState } from "react";

type AppRow = {
  id: string;
  orderId: string;
  source: string;
  status: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  userId: string;
  partnerId: string;
  partnerName: string;
  partnerCompany: string;
  partnerEmail: string;
  product: string;
  commission: number;
  commissionStatus: string;
  details: {
    email: string;
    phone: string;
    city: string;
    country: string;
    personalJson: unknown;
  };
};

const COMMISSION_STATUSES = [
  "Pending",
  "Approved",
  "Rejected",
  "Paid",
  "Not Eligible",
] as const;

export default function ApplicationsTable({ initialRows }: { initialRows: AppRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [commissionFilter, setCommissionFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AppRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((item) => {
      if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
      if (
        commissionFilter !== "all" &&
        item.commissionStatus !== commissionFilter
      ) {
        return false;
      }

      if (!q) return true;

      const searchable = [
        item.orderId,
        item.firstName,
        item.lastName,
        item.userId,
        item.partnerId,
        item.partnerName,
        item.partnerCompany,
        item.product,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [rows, sourceFilter, commissionFilter, query]);

  const exportCsv = () => {
    if (!filtered.length) return;

    const headers = [
      "Created At",
      "Order ID",
      "Source",
      "Status",
      "First Name",
      "Last Name",
      "User ID",
      "Partner ID",
      "Partner Name",
      "Partner Company",
      "Partner Email",
      "Product",
      "Commission",
      "Commission Status",
      "User Email",
      "User Phone",
      "User City",
      "User Country",
    ];

    const escapeCsv = (value: string | number) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replaceAll('"', '""')}"`;
    };

    const lines = filtered.map((item) =>
      [
        new Date(item.createdAt).toLocaleString(),
        item.orderId,
        item.source,
        item.status,
        item.firstName,
        item.lastName,
        item.userId,
        item.partnerId,
        item.partnerName,
        item.partnerCompany,
        item.partnerEmail,
        item.product,
        item.commission,
        item.commissionStatus,
        item.details.email,
        item.details.phone,
        item.details.city,
        item.details.country,
      ]
        .map(escapeCsv)
        .join(","),
    );

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-applications-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateCommissionStatus = async (
    applicationId: string,
    nextStatus: string,
  ) => {
    setUpdatingId(applicationId);

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/commission`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionStatus: nextStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update status");
      }

      setRows((prev) =>
        prev.map((item) =>
          item.id === applicationId
            ? { ...item, commissionStatus: data.commissionStatus }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Unable to update commission status");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, order, partner..."
            className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10 lg:col-span-2"
          />

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
          >
            <option value="all">All Sources</option>
            <option value="partner">Partner</option>
            <option value="user">User</option>
          </select>

          <select
            value={commissionFilter}
            onChange={(e) => setCommissionFilter(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10"
          >
            <option value="all">All Commission Status</option>
            {COMMISSION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
            applications
          </p>

          <button
            onClick={exportCsv}
            className="h-10 rounded-xl border border-[#820ad1]/20 bg-[#820ad1]/5 px-4 text-sm font-semibold text-[#820ad1] transition-colors hover:bg-[#820ad1]/10"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-3 xl:hidden">
        {filtered.map((item) => {
          const name = `${item.firstName} ${item.lastName}`.trim() || "-";
          const partnerLabel =
            item.partnerName || item.partnerCompany
              ? `${item.partnerName || "-"}${item.partnerCompany ? ` (${item.partnerCompany})` : ""}`
              : item.partnerId || "-";

          return (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.orderId}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                  {item.source}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p className="break-all">User: {item.userId || "-"}</p>
                <p>Partner: {partnerLabel}</p>
                <p>Product: {item.product || "-"}</p>
                <p>Status: {item.status}</p>
                <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Commission
                  </p>
                  <p className="mt-1 text-lg font-black text-[#820ad1]">
                    EUR {item.commission}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Commission Status
                  </p>
                  <select
                    disabled={updatingId === item.id}
                    value={item.commissionStatus}
                    onChange={(e) => updateCommissionStatus(item.id, e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10 disabled:opacity-60"
                  >
                    {COMMISSION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setSelected(item)}
                className="mt-4 h-10 w-full rounded-lg border border-[#820ad1]/20 bg-[#820ad1]/5 px-3 text-sm font-semibold text-[#820ad1] hover:bg-[#820ad1]/10"
              >
                View Full User Details
              </button>
            </div>
          );
        })}

        {!filtered.length ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            No applications found for current filters.
          </div>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white xl:block">
        <table className="w-full min-w-[1500px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Applicant
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                User ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Partner
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Commission
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Commission Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Details
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => {
              const name = `${item.firstName} ${item.lastName}`.trim() || "-";
              const partnerLabel =
                item.partnerName || item.partnerCompany
                  ? `${item.partnerName || "-"}${item.partnerCompany ? ` (${item.partnerCompany})` : ""}`
                  : item.partnerId || "-";

              return (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {item.orderId}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      {item.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.userId || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{partnerLabel}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.product || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    EUR {item.commission}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      disabled={updatingId === item.id}
                      value={item.commissionStatus}
                      onChange={(e) =>
                        updateCommissionStatus(item.id, e.target.value)
                      }
                      className="h-9 rounded-lg border border-gray-200 px-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#820ad1] focus:ring-4 focus:ring-[#820ad1]/10 disabled:opacity-60"
                    >
                      {COMMISSION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.status}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => setSelected(item)}
                      className="rounded-lg border border-[#820ad1]/20 bg-[#820ad1]/5 px-3 py-1.5 text-xs font-semibold text-[#820ad1] hover:bg-[#820ad1]/10"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-gray-900 sm:text-xl">
                Full User Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Applicant
                </p>
                <p className="mt-2 text-sm text-gray-800">
                  {`${selected.firstName} ${selected.lastName}`.trim() || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  User ID
                </p>
                <p className="mt-2 text-sm text-gray-800">{selected.userId || "-"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Email
                </p>
                <p className="mt-2 text-sm text-gray-800">
                  {selected.details.email || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Phone
                </p>
                <p className="mt-2 text-sm text-gray-800">
                  {selected.details.phone || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  City
                </p>
                <p className="mt-2 text-sm text-gray-800">{selected.details.city || "-"}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Country
                </p>
                <p className="mt-2 text-sm text-gray-800">
                  {selected.details.country || "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Full Personal JSON
              </p>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                {JSON.stringify(selected.details.personalJson, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
