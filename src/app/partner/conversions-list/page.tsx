"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ConversionsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        const partnerCode = session?.user?.partnerCode;

        if (!partnerCode) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/partner/conversions?partnerCode=${partnerCode}`
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

  return (
    <div className="space-y-8">
      {/* BREADCRUMB */}
      <div className="text-sm text-gray-500">
        Your Profile /{" "}
        <span className="font-semibold text-black">
          Conversions
        </span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#820ad1]/10 flex items-center justify-center">
              <BarChart3 className="text-[#820ad1]" size={28} />
            </div>

            <h1 className="text-5xl font-black text-gray-900">
              Conversions
            </h1>
          </div>

          <p className="text-gray-500 mt-5 text-lg">
            In the following, you can find an overview of the conversions.
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-wrap gap-4">
          <button className="h-14 px-8 rounded-full bg-[#820ad1] text-white font-semibold flex items-center gap-3 hover:scale-105 transition-all duration-200 shadow-lg shadow-[#820ad1]/20">
            <Download size={18} />
            DOWNLOAD
          </button>

          <button className="h-14 px-8 rounded-full bg-[#820ad1] text-white font-semibold flex items-center gap-3 hover:scale-105 transition-all duration-200 shadow-lg shadow-[#820ad1]/20">
            <Plus size={18} />
            CREATE APPLICATION
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* TABLE HEADER */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-[#fafafa] border-b border-gray-100">
              <tr>
                <th className="text-left px-8 py-6 text-sm font-semibold text-gray-600">
                  Creation Date
                </th>

                <th className="text-left px-6 py-6 text-sm font-semibold text-gray-600">
                  First Name
                </th>

                <th className="text-left px-6 py-6 text-sm font-semibold text-gray-600">
                  Last Name
                </th>

                <th className="text-left px-6 py-6 text-sm font-semibold text-gray-600">
                  Product
                </th>

                <th className="text-left px-6 py-6 text-sm font-semibold text-gray-600">
                  User ID
                </th>

                <th className="text-left px-6 py-6 text-sm font-semibold text-gray-600">
                  Commission
                </th>

                <th className="text-left px-6 py-6 text-sm font-semibold text-gray-600">
                  Commission Status
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-gray-400"
                  >
                    Loading conversions...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-gray-400"
                  >
                    No conversions found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-b border-gray-100 hover:bg-[#faf7ff] transition-all"
                  >
                    {/* DATE */}
                    <td className="px-8 py-6 text-gray-700">
                      <div className="flex flex-col">
                        <span>
                          {new Date(
                            item.createdAt
                          ).toLocaleDateString()}
                        </span>

                        <span className="text-sm text-gray-400 mt-1">
                          {new Date(
                            item.createdAt
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>

                    {/* FIRST NAME */}
                    <td className="px-6 py-6 font-medium text-gray-800">
                      {item.firstName || "—"}
                    </td>

                    {/* LAST NAME */}
                    <td className="px-6 py-6 font-medium text-gray-800">
                      {item.lastName || "—"}
                    </td>

                    {/* PRODUCT */}
                    <td className="px-6 py-6">
                      <span className="px-4 py-2 rounded-full bg-[#820ad1]/10 text-[#820ad1] text-sm font-medium">
                        {item.product || "Insurance"}
                      </span>
                    </td>

                    {/* USER ID */}
                    <td className="px-6 py-6 text-gray-700">
                      {item.userId || item.partnerId || "—"}
                    </td>

                    {/* COMMISSION */}
                    <td className="px-6 py-6 font-semibold text-[#820ad1] text-lg">
                      €{item.commission || 20}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-6">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          item.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <span>Rows per page:</span>

            <select className="outline-none bg-transparent font-medium text-gray-700">
              <option>50</option>
              <option>25</option>
              <option>10</option>
            </select>
          </div>

          <div className="flex items-center gap-8">
            <span className="text-sm text-gray-500">
              {data.length === 0
                ? "0-0 of 0"
                : `1-${data.length} of ${data.length}`}
            </span>

            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100">
                <ChevronLeft size={18} />
              </button>

              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}