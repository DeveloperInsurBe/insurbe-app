"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  BarChart3,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import CreateApplicationModal from "../CreateApplicationModal";

type ConversionItem = {
  id?: string;
  createdAt: string;
  firstName?: string | null;
  lastName?: string | null;
  product?: string | null;
  userId?: string | null;
  partnerId?: string | null;
  commission?: number | null;
  commissionStatus?: string | null;
};

type ConversionsClientProps = {
  initialData: ConversionItem[];
  partnerRef: string;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

type Highlight = { top: number; height: number; visible: boolean; animate: boolean };

export default function ConversionsClient({
  initialData,
  partnerRef,
  page,
  pageSize,
  totalCount,
  totalPages,
}: ConversionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data] = useState<ConversionItem[]>(initialData);
  const [openModal, setOpenModal] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  const pageStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalCount);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Keep list fresh when user returns to this tab/window.
  // This avoids stale data without bringing back initial-page loading states.
  useEffect(() => {
    // "focus" and "visibilitychange" usually fire together; refresh only once.
    let lastRefreshAt = 0;

    const handleFocusRefresh = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        if (now - lastRefreshAt < 1000) return;
        lastRefreshAt = now;
        router.refresh();
      }
    };

    window.addEventListener("focus", handleFocusRefresh);
    document.addEventListener("visibilitychange", handleFocusRefresh);

    return () => {
      window.removeEventListener("focus", handleFocusRefresh);
      document.removeEventListener("visibilitychange", handleFocusRefresh);
    };
  }, [router]);

  const handlePageChange = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (nextSize: number) => {
    if (nextSize === pageSize) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", String(nextSize));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDownload = () => {
    if (!data.length) return;

    // FORMAT TABLE DATA
    const formattedData = data.map((item) => ({
      "Creation Date": new Date(item.createdAt).toLocaleDateString(),

      "Creation Time": new Date(item.createdAt).toLocaleTimeString(),

      "First Name": item.firstName || "-",

      "Last Name": item.lastName || "-",

      Product: item.product || "-",

      "User ID": item.userId || item.partnerId || "-",

      Commission: `€${item.commission ?? 0}`,

      Status: item.commissionStatus || "Pending",
    }));

    // CREATE WORKSHEET
    const worksheet = XLSX.utils.json_to_sheet([]);

    // ADD CUSTOM HEADER
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ["INSUREBE PARTNER CONVERSIONS REPORT"],
        [],
        [
          "Track all submitted insurance applications, commissions and conversion reports.",
        ],
        [],
        ["Generated At", new Date().toLocaleString()],
        ["Total Conversions", data.length],
        [
          "Total Commission",
          `€${data.reduce((acc, item) => acc + (item.commission || 0), 0)}`,
        ],
        [],
      ],
      {
        origin: "A1",
      },
    );

    // ADD TABLE DATA
    XLSX.utils.sheet_add_json(worksheet, formattedData, {
      origin: "A10",
      skipHeader: false,
    });

    // COLUMN WIDTHS
    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 35 },
      { wch: 35 },
      { wch: 15 },
      { wch: 18 },
    ];

    // CREATE WORKBOOK
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Conversions");

    // GENERATE FILE
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, `partner-conversions-${Date.now()}.xlsx`);
  };

  // A background pill slides to whichever table row is hovered
  // (same interaction as the product picker in CreateApplicationModal).
  const highlightRow = (el: HTMLElement) => {
    const table = tableRef.current;
    if (!table) return;
    const tableRect = table.getBoundingClientRect();
    const rowRect = el.getBoundingClientRect();
    setHighlight((prev) => ({
      top: rowRect.top - tableRect.top,
      height: rowRect.height,
      visible: true,
      animate: prev !== null,
    }));
  };

  const hideHighlight = () =>
    setHighlight((h) => (h ? { ...h, visible: false } : h));

  // Staggered entrance, capped so long pages don't wait on the last rows.
  const rowDelay = (index: number) => 260 + Math.min(index, 12) * 45;

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        {/* BREADCRUMB */}
        <div className="modal-item-in text-sm text-gray-500">
          Your Profile /{" "}
          <span className="font-semibold text-black">Conversions</span>
        </div>

        {/* HEADER */}
        <section className="modal-panel-in relative overflow-hidden rounded-[28px] border border-[#f0e6fb] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] px-5 py-5 text-[#111827] shadow-[0_12px_40px_rgba(130,10,209,0.08)] sm:px-7 sm:py-6 md:rounded-[32px] md:px-9 md:py-7">
          {/* animated background shapes */}
          <div className="modal-float pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#820ad1]/10 blur-2xl" />
          <div
            className="modal-float pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#a855f7]/15 blur-3xl"
            style={{ animationDelay: "-4s" }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage: "radial-gradient(circle, #820ad1 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative z-10 flex flex-col gap-4 lg:gap-8 xl:flex-row xl:items-center xl:justify-between">
            {/* LEFT CONTENT */}
            <div className="flex flex-col gap-2 md:gap-2.5">
              {/* TOP */}
              <div className="flex items-start gap-4 sm:items-center">
                {/* ICON */}
                <div
                  className="modal-item-in relative h-11 w-11 shrink-0 sm:h-12 sm:w-12"
                  style={{ animationDelay: "120ms" }}
                >
                  <span className="modal-ring absolute inset-0 rounded-2xl bg-[#820ad1]/25" />
                  <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white shadow-lg shadow-[#820ad1]/25">
                    <BarChart3 size={22} />
                  </span>
                </div>

                {/* TITLE */}
                <div>
                  <h1
                    className="modal-item-in text-xl font-extrabold leading-tight tracking-tight sm:text-2xl md:text-[26px]"
                    style={{ animationDelay: "180ms" }}
                  >
                    Conversions
                  </h1>

                  <div
                    className="modal-item-in mt-1.5 h-1.5 w-16 rounded-full bg-[#820ad1]/20"
                    style={{ animationDelay: "240ms" }}
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <p
                className="modal-item-in max-w-xl text-[13px] leading-relaxed text-[#667085] md:text-sm"
                style={{ animationDelay: "300ms" }}
              >
                Track all submitted insurance applications, monitor commissions,
                and manage partner conversions in one place.
              </p>
            </div>

            {/* BUTTONS */}
            <div
              className="modal-item-in flex w-full flex-col gap-3 sm:flex-row sm:gap-4 xl:w-auto"
              style={{ animationDelay: "380ms" }}
            >
              {/* DOWNLOAD */}
              <button
                onClick={handleDownload}
                className="group flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#e9d7ff] bg-white px-5 font-semibold text-[#820ad1] shadow-sm transition-all duration-300 hover:border-transparent hover:bg-[#820ad1] hover:text-white active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820ad1]/40 sm:w-auto md:h-14 md:px-7"
              >
                <Download
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                />
                <span className="whitespace-nowrap text-sm md:text-base">
                  Download Report
                </span>
              </button>

              {/* CREATE APPLICATION */}
              <button
                onClick={() => setOpenModal(true)}
                className="group flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] px-5 font-semibold text-white shadow-xl shadow-[#820ad1]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820ad1]/40 sm:w-auto md:h-14 md:px-7"
              >
                <Plus
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />

                <span className="whitespace-nowrap text-sm md:text-base">
                  Create Application
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* RECENT CONVERSIONS */}
        <div
          className="modal-item-in flex min-h-[420px] flex-col overflow-hidden rounded-[24px] border border-[#f0e6fb] bg-white shadow-[0_10px_35px_rgba(130,10,209,0.06)] md:min-h-[480px] md:rounded-[28px]"
          style={{ animationDelay: "200ms" }}
        >
          {/* TOP BAR */}
          <div className="flex flex-col gap-3 border-b border-[#f4ecfc] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#820ad1]">
                <BarChart3 size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-gray-900 md:text-lg">
                  Recent Conversions
                </h2>
                <p className="truncate text-xs text-gray-500 md:text-[13px]">
                  Submitted insurance applications and commissions
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px] text-[#820ad1]">
                Rows
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="h-8 cursor-pointer rounded-lg border border-[#e9d7ff] bg-white px-2 text-xs font-semibold normal-case tracking-normal text-gray-700 outline-none transition-colors hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-2 focus:ring-[#820ad1]/15"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <span className="inline-flex items-center rounded-full bg-[#f3e8ff] px-3 py-1 text-xs font-bold text-[#820ad1]">
                {totalCount} Total
              </span>
            </div>
          </div>

          {data.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div
                className="modal-item-in relative mb-5 h-16 w-16"
                style={{ animationDelay: "260ms" }}
              >
                <span className="modal-ring absolute inset-0 rounded-2xl bg-[#820ad1]/20" />
                <span className="relative flex h-full w-full items-center justify-center rounded-2xl border border-[#efe3fb] bg-gradient-to-br from-[#faf7ff] to-[#f3e8ff]">
                  <BarChart3 className="text-[#820ad1]" size={28} />
                </span>
              </div>

              <h3
                className="modal-item-in text-lg font-extrabold text-gray-900"
                style={{ animationDelay: "320ms" }}
              >
                No Conversions Yet
              </h3>

              <p
                className="modal-item-in mt-2 max-w-sm text-sm leading-relaxed text-gray-500"
                style={{ animationDelay: "380ms" }}
              >
                Once you create insurance applications, your conversions and
                commissions will automatically appear here.
              </p>

              <button
                onClick={() => setOpenModal(true)}
                className="modal-item-in group mt-6 flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] px-5 text-sm font-semibold text-white shadow-lg shadow-[#820ad1]/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#820ad1]/30"
                style={{ animationDelay: "440ms" }}
              >
                <Plus
                  size={16}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />
                <span>Create Application</span>
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden flex-1 lg:block">
                <div
                  ref={tableRef}
                  className="relative"
                  onMouseLeave={hideHighlight}
                >
                  {/* sliding highlight */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 top-0 rounded-2xl bg-gradient-to-r from-[#faf7ff] to-[#f3e8ff] ring-1 ring-[#e9d7ff]"
                    style={{
                      height: highlight?.height ?? 0,
                      transform: `translateY(${highlight?.top ?? 0}px)`,
                      opacity: highlight?.visible ? 1 : 0,
                      transition: highlight?.animate
                        ? "transform 320ms cubic-bezier(0.16,1,0.3,1), height 320ms cubic-bezier(0.16,1,0.3,1), opacity 200ms"
                        : "opacity 200ms",
                    }}
                  />

                  <table className="relative z-10 w-full table-fixed">
                    <thead className="border-b border-[#f0e6fb] bg-[#faf7ff]">
                      <tr className="text-left text-[11px] font-bold uppercase tracking-[1.5px] text-[#820ad1]">
                        <th className="w-[34%] px-6 py-3.5 md:px-7">Customer</th>
                        <th className="w-[22%] px-4 py-3.5">Product</th>
                        <th className="w-[16%] px-4 py-3.5">Created</th>
                        <th className="w-[12%] px-4 py-3.5 text-right">Commission</th>
                        <th className="w-[16%] px-6 py-3.5 text-right md:px-7">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.map((item, index) => (
                        <tr
                          key={item.id || index}
                          onMouseEnter={(e) => highlightRow(e.currentTarget)}
                          style={{ animationDelay: `${rowDelay(index)}ms` }}
                          className="modal-item-in group border-b border-[#f4ecfc] last:border-b-0"
                        >
                          {/* CUSTOMER */}
                          <td className="px-6 py-3.5 md:px-7">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3e8ff] text-xs font-black text-[#820ad1] transition-colors duration-300 group-hover:bg-[#820ad1] group-hover:text-white">
                                {conversionInitials(item)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {[item.firstName, item.lastName].filter(Boolean).join(" ") || "—"}
                                </p>
                                <p
                                  className="truncate text-xs text-gray-500"
                                  title={item.userId || undefined}
                                >
                                  {item.userId || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* PRODUCT */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex max-w-full items-center rounded-lg border border-[#efe3fb] bg-white px-2.5 py-1 text-xs font-bold text-[#820ad1] shadow-sm">
                              <span className="truncate">{item.product || "Insurance"}</span>
                            </span>
                          </td>

                          {/* CREATED */}
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </p>
                          </td>

                          {/* COMMISSION */}
                          <td className="px-4 py-3.5 text-right">
                            <p className="text-lg font-black text-[#820ad1]">
                              €{item.commission ?? 0}
                            </p>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-3.5 text-right md:px-7">
                            <StatusPill status={item.commissionStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE / TABLET CARDS */}
              <div className="grid flex-1 grid-cols-1 content-start gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:hidden">
                {data.map((item, index) => (
                  <div
                    key={item.id || index}
                    style={{ animationDelay: `${rowDelay(index)}ms` }}
                    className="modal-item-in group rounded-2xl border border-[#efe3fb] bg-white p-3.5 shadow-sm transition-[background-color,box-shadow,border-color] duration-300 hover:border-[#e9d7ff] hover:bg-[#faf7ff] hover:shadow-[0_12px_30px_rgba(130,10,209,0.10)]"
                  >
                    {/* CUSTOMER + STATUS */}
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3e8ff] text-xs font-black text-[#820ad1] transition-colors duration-300 group-hover:bg-[#820ad1] group-hover:text-white">
                        {conversionInitials(item)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {[item.firstName, item.lastName].filter(Boolean).join(" ") || "—"}
                        </p>
                        <p className="break-all text-xs text-gray-500">{item.userId || "—"}</p>
                      </div>
                      <StatusPill status={item.commissionStatus} />
                    </div>

                    {/* PRODUCT + DATE + COMMISSION */}
                    <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#f4ecfc] pt-3">
                      <div className="min-w-0">
                        <span className="inline-flex max-w-full items-center rounded-lg border border-[#efe3fb] bg-white px-2.5 py-1 text-[11px] font-bold text-[#820ad1] shadow-sm">
                          <span className="truncate">{item.product || "Insurance"}</span>
                        </span>
                        <p className="mt-1.5 text-[11px] text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()} ·{" "}
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="shrink-0 text-xl font-black text-[#820ad1]">
                        €{item.commission ?? 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="mt-auto flex flex-col gap-3 border-t border-[#f4ecfc] bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-7">
                <div className="text-xs text-gray-500 sm:text-sm">
                  Showing {pageStart}-{pageEnd} of{" "}
                  <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
                  conversions
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!hasPrev}
                    aria-label="Previous page"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e9d7ff] bg-white text-[#820ad1] transition-colors duration-300 enabled:hover:border-transparent enabled:hover:bg-[#820ad1] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="rounded-full bg-[#f3e8ff] px-3 py-1.5 text-xs font-bold text-[#820ad1]">
                    Page {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasNext}
                    aria-label="Next page"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e9d7ff] bg-white text-[#820ad1] transition-colors duration-300 enabled:hover:border-transparent enabled:hover:bg-[#820ad1] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      <CreateApplicationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        partnerRef={partnerRef}
      />
    </>
  );
}

function conversionInitials(item: ConversionItem) {
  const letters = [item.firstName, item.lastName]
    .map((part) => part?.trim()?.[0] ?? "")
    .join("")
    .toUpperCase();

  return letters || "—";
}

// Same colours as before: Approved green, everything else amber.
function StatusPill({ status }: { status?: string | null }) {
  const approved = status === "Approved";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status || "Pending"}
    </span>
  );
}
