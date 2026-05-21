"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  BarChart3,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Briefcase,
  Plane,
} from "lucide-react";

export default function ConversionsPage() {
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerRef, setPartnerRef] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const sessionRes = await fetch("/api/auth/session");

        const session = await sessionRes.json();
        console.log(session);

        const partnerEmail = session?.user?.email;
        if (!partnerEmail) {
          setLoading(false);
          return;
        }

        const userRes = await fetch(
          `/api/partner/get-partner-id?email=${partnerEmail}`,
        );

        const userData = await userRes.json();

        setPartnerRef(userData.partnerId || "");

        const res = await fetch(
          `/api/partner/conversions?partnerId=${userData.partnerId}`,
        );

        const result = await res.json();

        setData(result || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

      Commission: `€${item.commission || 5}`,

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

  return (
    <>
      <div className="space-y-8">
        {/* BREADCRUMB */}
        <div className="text-sm text-gray-500">
          Your Profile /{" "}
          <span className="font-semibold text-black">Conversions</span>
        </div>

        {/* HEADER */}
        <div className="relative overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm p-6 md:p-8">
          {/* BG GRADIENT */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#820ad1]/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            {/* LEFT CONTENT */}
            <div className="flex flex-col gap-5">
              {/* TOP */}
              <div className="flex items-start sm:items-center gap-4">
                {/* ICON */}
                <div className="min-w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#9f3cff] flex items-center justify-center shadow-lg shadow-[#820ad1]/20">
                  <BarChart3 className="text-white" size={28} />
                </div>

                {/* TITLE */}
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                    Conversions
                  </h1>

                  <div className="mt-2 h-2 w-24 rounded-full bg-[#820ad1]/20" />
                </div>
              </div>

              {/* DESCRIPTION */}
              <p className="text-gray-500 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
                Track all submitted insurance applications, monitor commissions,
                and manage partner conversions in one place.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4">
              {/* DOWNLOAD */}
              <button
                onClick={handleDownload}
                className="group cursor-pointer w-full sm:w-auto h-12 md:h-14 px-5 md:px-7 rounded-2xl bg-white border border-[#820ad1]/20 text-[#820ad1] font-semibold flex items-center justify-center gap-3 hover:bg-[#820ad1] hover:text-white transition-all duration-300 shadow-sm"
              >
                {" "}
                <Download
                  size={18}
                  className="group-hover:scale-110 transition-all"
                />
                <span className="whitespace-nowrap text-sm md:text-base">
                  Download Report
                </span>
              </button>

              {/* CREATE APPLICATION */}
              <button
                onClick={() => setOpenModal(true)}
                className="group cursor-pointer w-full sm:w-auto h-12 md:h-14 px-5 md:px-7 rounded-2xl bg-gradient-to-r from-[#820ad1] to-[#9f3cff] text-white font-semibold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-[#820ad1]/20"
              >
                <Plus
                  size={18}
                  className="group-hover:rotate-90 transition-all duration-300"
                />

                <span className="whitespace-nowrap text-sm md:text-base">
                  Create Application
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* CONVERSIONS TABLE */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          {/* TOP BAR */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 px-6 md:px-8 py-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                Recent Conversions
              </h2>

              <p className="text-gray-500 mt-2 text-sm md:text-base">
                Track all submitted insurance applications and commissions.
              </p>
            </div>

            <div className="w-fit inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#820ad1]/10 text-[#820ad1] text-sm font-semibold">
              {data.length} Total
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 px-6">
              <div className="w-14 h-14 rounded-full border-4 border-[#820ad1]/20 border-t-[#820ad1] animate-spin" />

              <p className="mt-6 text-gray-500 font-medium">
                Loading conversions...
              </p>
            </div>
          ) : data.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-24 h-24 rounded-3xl bg-[#820ad1]/10 flex items-center justify-center mb-8">
                <BarChart3 className="text-[#820ad1]" size={42} />
              </div>

              <h3 className="text-2xl font-black text-gray-900">
                No Conversions Yet
              </h3>

              <p className="text-gray-500 mt-4 max-w-md leading-relaxed">
                Once you create insurance applications, your conversions and
                commissions will automatically appear here.
              </p>

              <button
                onClick={() => setOpenModal(true)}
                className="mt-8 h-12 px-6 rounded-2xl bg-gradient-to-r from-[#820ad1] to-[#9f3cff] text-white font-semibold flex items-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-[#820ad1]/20"
              >
                <Plus size={18} />

                <span>Create Application</span>
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-[#fafafa] border-b border-gray-100">
                    <tr>
                      <th className="text-left px-8 py-5 text-sm font-semibold text-gray-500">
                        Creation Date
                      </th>

                      <th className="text-left px-6 py-5 text-sm font-semibold text-gray-500">
                        First Name
                      </th>

                      <th className="text-left px-6 py-5 text-sm font-semibold text-gray-500">
                        Last Name
                      </th>

                      <th className="text-left px-6 py-5 text-sm font-semibold text-gray-500">
                        Product
                      </th>

                      <th className="text-left px-6 py-5 text-sm font-semibold text-gray-500">
                        User ID
                      </th>

                      <th className="text-left px-6 py-5 text-sm font-semibold text-gray-500">
                        Commission
                      </th>

                      <th className="text-left px-6 py-5 text-sm font-semibold text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-gray-100 hover:bg-[#faf7ff] transition-all duration-200"
                      >
                        {/* DATE */}
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 text-base">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>

                            <span className="text-sm text-gray-400 mt-1">
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
                          <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-[#820ad1]/10 text-[#820ad1] text-sm font-semibold max-w-[240px]">
                            <span className="truncate">
                              {item.product || "Insurance"}
                            </span>
                          </div>
                        </td>

                        {/* USER ID */}
                        <td className="px-6 py-6">
                          <div className="max-w-[240px]">
                            <p className="text-gray-700 font-medium truncate">
                              {item.userId || "—"}
                            </p>
                          </div>
                        </td>

                        {/* COMMISSION */}
                        <td className="px-6 py-6">
                          <p className="text-2xl font-black text-[#820ad1]">
                            €{item.commission || 5}
                          </p>
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-6">
                          <div
                            className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold ${
                              item.commissionStatus === "Approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-70" />

                            {item.commissionStatus || "Pending"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="xl:hidden p-5 space-y-5">
                {data.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-3xl border border-gray-100 bg-[#fcfcfc] p-5 shadow-sm"
                  >
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>

                        <div className="mt-3 inline-flex items-center px-3 py-2 rounded-2xl bg-[#820ad1]/10 text-[#820ad1] text-xs font-semibold">
                          {item.product || "Insurance"}
                        </div>
                      </div>

                      <div
                        className={`px-3 py-2 rounded-2xl text-xs font-semibold ${
                          item.commissionStatus === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.commissionStatus || "Pending"}
                      </div>
                    </div>

                    {/* USER DETAILS */}
                    <div className="mt-6 grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          First Name
                        </p>

                        <p className="font-semibold text-gray-900 mt-1">
                          {item.firstName || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Last Name
                        </p>

                        <p className="font-semibold text-gray-900 mt-1">
                          {item.lastName || "—"}
                        </p>
                      </div>
                    </div>

                    {/* USER ID */}
                    <div className="mt-5">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        User ID
                      </p>

                      <p className="font-medium text-gray-700 mt-1 break-all">
                        {item.userId || "—"}
                      </p>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Commission
                        </p>

                        <p className="text-3xl font-black text-[#820ad1] mt-1">
                          €{item.commission || 5}
                        </p>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center">
                        <BarChart3 className="text-[#820ad1]" size={22} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-8 py-5 border-t border-gray-100 bg-white">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {data.length}
                  </span>{" "}
                  conversions
                </div>

                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all">
                    <ChevronLeft size={18} />
                  </button>

                  <button className="w-10 h-10 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-5xl bg-white rounded-[32px] p-8 md:p-10 relative animate-in fade-in zoom-in duration-200">
            {/* CLOSE */}
            <button
              onClick={() => setOpenModal(false)}
              className="absolute right-6 top-6 w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
            >
              <X size={22} />
            </button>

            {/* TITLE */}
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Please Select a Product Type
              </h2>

              <p className="text-gray-500 mt-3 text-lg">
                Choose an insurance category to continue application process.
              </p>
            </div>

            {/* CARDS */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* PUBLIC */}
              <button
                onClick={() => {
                  router.push(
                    `/insuranceSignupFlow?provider=dak&source=partner&ref=${partnerRef}`,
                  );
                }}
                className="group text-left cursor-pointer border border-gray-200 hover:border-[#820ad1] rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center mb-6">
                  <Shield className="text-[#820ad1]" size={30} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                  Public Health Insurance
                </h3>

                <p className="text-gray-500 mt-4 leading-relaxed">
                  Students / Employees
                </p>
              </button>

              {/* PRIVATE */}
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/partner/create-application", {
                      method: "POST",

                      headers: {
                        "Content-Type": "application/json",
                      },

                      body: JSON.stringify({
                        product: "Private Health Insurance",
                      }),
                    });

                    const result = await res.json();

                    if (!res.ok) {
                      alert(result.error || "Something went wrong");
                      return;
                    }

                    router.push("/mawistaBooking?source=partner");
                  } catch (error) {
                    console.error(error);

                    alert("Something went wrong");
                  }
                }}
                className="group text-left cursor-pointer border-2 border-[#820ad1] bg-[#faf7ff] rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center mb-6">
                  <Briefcase className="text-[#820ad1]" size={30} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                  Private Health Insurance
                </h3>

                <p className="text-gray-500 mt-4 leading-relaxed">
                  Students / Working Professionals
                </p>
              </button>

              {/* TRAVEL */}
              <button
                disabled
                className="group text-left border border-gray-200 opacity-60 rounded-3xl p-7"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center mb-6">
                  <Plane className="text-[#820ad1]" size={30} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                  Travel Students to Germany
                </h3>

                <p className="text-gray-500 mt-4 leading-relaxed">
                  Incoming / Travel Insurance
                </p>

                <div className="mt-6 inline-flex px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold">
                  Coming Soon
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
