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

        {/* CONVERSIONS TABLE */}
        <div
          className="modal-item-in overflow-hidden rounded-[24px] border border-[#f0e6fb] bg-white shadow-[0_10px_35px_rgba(130,10,209,0.06)] md:rounded-[32px]"
          style={{ animationDelay: "200ms" }}
        >
          {/* TOP BAR */}
          <div className="flex flex-col gap-5 border-b border-[#f4ecfc] px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 md:text-3xl">
                Recent Conversions
              </h2>

              <p className="mt-2 text-sm text-gray-500 md:text-base">
                Track all submitted insurance applications and commissions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                Rows
              </label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-9 cursor-pointer rounded-xl border border-[#e9d7ff] bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition-colors hover:border-[#d8b4fe] focus:border-[#820ad1] focus:ring-2 focus:ring-[#820ad1]/15"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f3e8ff] px-4 py-2 text-sm font-bold text-[#820ad1]">
                {totalCount} Total
              </div>
            </div>
          </div>

          {data.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
              <div
                className="modal-item-in relative mb-8 h-24 w-24"
                style={{ animationDelay: "260ms" }}
              >
                <span className="modal-ring absolute inset-0 rounded-3xl bg-[#820ad1]/20" />
                <span className="relative flex h-full w-full items-center justify-center rounded-3xl border border-[#efe3fb] bg-gradient-to-br from-[#faf7ff] to-[#f3e8ff]">
                  <BarChart3 className="text-[#820ad1]" size={42} />
                </span>
              </div>

              <h3
                className="modal-item-in text-2xl font-black text-gray-900"
                style={{ animationDelay: "320ms" }}
              >
                No Conversions Yet
              </h3>

              <p
                className="modal-item-in mt-4 max-w-md leading-relaxed text-gray-500"
                style={{ animationDelay: "380ms" }}
              >
                Once you create insurance applications, your conversions and
                commissions will automatically appear here.
              </p>

              <button
                onClick={() => setOpenModal(true)}
                className="modal-item-in group mt-8 flex h-12 cursor-pointer items-center gap-3 rounded-2xl bg-gradient-to-r from-[#820ad1] to-[#a855f7] px-6 font-semibold text-white shadow-lg shadow-[#820ad1]/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#820ad1]/30"
                style={{ animationDelay: "440ms" }}
              >
                <Plus
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />

                <span>Create Application</span>
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto xl:block">
                <div
                  ref={tableRef}
                  className="relative min-w-[1200px]"
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

                  <table className="relative z-10 w-full">
                    <thead className="border-b border-[#f0e6fb] bg-[#faf7ff]">
                      <tr>
                        <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          Creation Date
                        </th>

                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          First Name
                        </th>

                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          Last Name
                        </th>

                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          Product
                        </th>

                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          User ID
                        </th>

                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          Commission
                        </th>

                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          Status
                        </th>
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
                          {/* DATE */}
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-base font-semibold text-gray-900">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>

                              <span className="mt-1 text-sm text-gray-400">
                                {new Date(item.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </td>

                          {/* FIRST NAME */}
                          <td className="px-6 py-6">
                            <div className="font-semibold text-gray-900">
                              {item.firstName || "—"}
                            </div>
                          </td>

                          {/* LAST NAME */}
                          <td className="px-6 py-6">
                            <div className="font-semibold text-gray-900">
                              {item.lastName || "—"}
                            </div>
                          </td>

                          {/* PRODUCT */}
                          <td className="px-6 py-6">
                            <div className="inline-flex max-w-[240px] items-center rounded-xl border border-[#efe3fb] bg-white px-3.5 py-1.5 text-sm font-bold text-[#820ad1] shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-1">
                              <span className="truncate">
                                {item.product || "Insurance"}
                              </span>
                            </div>
                          </td>

                          {/* USER ID */}
                          <td className="px-6 py-6">
                            <div className="max-w-[240px]">
                              <p className="truncate font-medium text-gray-700">
                                {item.userId || "—"}
                              </p>
                            </div>
                          </td>

                          {/* COMMISSION */}
                          <td className="px-6 py-6">
                            <p className="text-2xl font-black text-[#820ad1]">
                              €{item.commission ?? 0}
                            </p>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-6">
                            <div
                              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                                item.commissionStatus === "Approved"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              <span className="mr-2 h-2 w-2 rounded-full bg-current opacity-70" />

                              {item.commissionStatus || "Pending"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE CARDS */}
              <div className="space-y-3 p-4 sm:space-y-4 sm:p-5 xl:hidden">
                {data.map((item, index) => (
                  <div
                    key={item.id || index}
                    style={{ animationDelay: `${rowDelay(index)}ms` }}
                    className="modal-item-in group rounded-2xl border border-[#efe3fb] bg-white p-4 shadow-sm transition-[background-color,box-shadow,border-color] duration-300 hover:border-[#e9d7ff] hover:bg-[#faf7ff] hover:shadow-[0_12px_30px_rgba(130,10,209,0.10)] sm:p-5"
                  >
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>

                        <div className="mt-3 inline-flex items-center rounded-xl border border-[#efe3fb] bg-white px-3 py-1.5 text-xs font-bold text-[#820ad1] shadow-sm">
                          {item.product || "Insurance"}
                        </div>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          item.commissionStatus === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.commissionStatus || "Pending"}
                      </div>
                    </div>

                    {/* USER DETAILS */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          First Name
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          {item.firstName || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          Last Name
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          {item.lastName || "—"}
                        </p>
                      </div>
                    </div>

                    {/* USER ID */}
                    <div className="mt-5">
                      <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                        User ID
                      </p>

                      <p className="mt-1 break-all font-medium text-gray-700">
                        {item.userId || "—"}
                      </p>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-6 flex items-center justify-between border-t border-[#f4ecfc] pt-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                          Commission
                        </p>

                        <p className="mt-1 text-3xl font-black text-[#820ad1]">
                          €{item.commission ?? 0}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e9d7ff] bg-white text-[#820ad1] transition-colors duration-300 group-hover:border-transparent group-hover:bg-[#820ad1] group-hover:text-white">
                        <BarChart3 size={22} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="flex flex-col justify-between gap-4 border-t border-[#f4ecfc] bg-white px-4 py-5 sm:flex-row sm:items-center sm:px-6 md:px-8">
                <div className="text-sm text-gray-500">
                  Showing {pageStart}-{pageEnd} of{" "}
                  <span className="font-semibold text-gray-900">
                    {totalCount}
                  </span>{" "}
                  conversions
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!hasPrev}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#e9d7ff] bg-white text-[#820ad1] transition-colors duration-300 enabled:hover:border-transparent enabled:hover:bg-[#820ad1] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="rounded-full bg-[#f3e8ff] px-3 py-1.5 text-xs font-bold text-[#820ad1]">
                    Page {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasNext}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#e9d7ff] bg-white text-[#820ad1] transition-colors duration-300 enabled:hover:border-transparent enabled:hover:bg-[#820ad1] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
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
