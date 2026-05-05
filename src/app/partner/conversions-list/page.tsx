"use client";

import { useEffect, useState } from "react";

export default function ConversionsPage() {
  const [data, setData] = useState<any[]>([]);

 useEffect(() => {
  async function loadData() {
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    const partnerCode = session?.user?.partnerCode;

    if (!partnerCode) return;

    const res = await fetch(
      `/api/partner/conversions?partnerCode=${partnerCode}`
    );

    const data = await res.json();
    setData(data);
  }

  loadData();
}, []);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Conversions</h1>

        <div className="flex gap-2">
          <button className="bg-[#820ad1] text-white px-4 py-2 rounded-full">
            Download
          </button>
          <button className="bg-[#820ad1] text-white px-4 py-2 rounded-full">
            Create Application
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border">

        <div className="grid grid-cols-5 px-4 py-3 text-sm font-medium bg-gray-50">
          <p>Date</p>
          <p>Order ID</p>
          <p>Status</p>
          <p>Partner</p>
          <p>Created</p>
        </div>

        {data.length === 0 ? (
          <p className="p-4 text-gray-400">No data</p>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-5 px-4 py-3 border-t text-sm"
            >
              <p>{new Date(item.createdAt).toLocaleDateString()}</p>
              <p>{item.orderId}</p>
              <p>{item.status}</p>
              <p>{item.partnerId}</p>
              <p>{new Date(item.createdAt).toLocaleTimeString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}