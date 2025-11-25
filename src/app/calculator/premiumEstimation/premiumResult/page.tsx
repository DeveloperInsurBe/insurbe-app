// app/premiumResult/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePremiumStore } from "@/app/stores/premiumStore";
import BookAppointmentModal from "@/app/components/BookAppointmentModal";

function base64ToBlob(base64: string, mime = "") {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime || "" });
}

export default function PremiumResult() {
  const router = useRouter();
  const { form, premium, documents } = usePremiumStore();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // image path you uploaded (tool will transform to URL). Using here as hero / optional.

  function downloadDoc(base64: string, suggestedName = "doc") {
    let mime = "";
    const header = base64.slice(0, 8);
    if (header.startsWith("JVBER")) mime = "application/pdf";
    else if (header.slice(0, 4) === "UEsD") mime = "application/zip";
    else mime = "application/octet-stream";

    const blob = base64ToBlob(base64, mime);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      suggestedName +
      (mime === "application/pdf"
        ? ".pdf"
        : mime === "application/zip"
        ? ".zip"
        : ".bin");
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:underline mb-4"
        >
          ← Back to Plans
        </button>

        <h2 className="text-center text-xl font-semibold mb-2">
          Your Premium Estimation
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Based on your details, here&apos;s your monthly premium for{" "}
          {form.planNameVersion || "MAWISTA Expat"}
        </p>

        {/* hero / purple card */}
        <div
          className="rounded-xl overflow-hidden mb-6 bg-primary"
          
        >
          <div className="py-10 text-center text-white">
            <div className="text-sm mb-1">Monthly Premium</div>
            <div className="text-6xl font-bold">€{premium ?? "—"}</div>
            <div className="text-sm opacity-90 mt-1">per month</div>
          </div>
        </div>

        {/* Documents grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {documents && documents.length > 0 ? (
            documents.map((d, i) => (
              <div key={i} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm font-semibold mb-1">
                  {d.kurz || `Document ${i + 1}`}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Insurance Product Information Document
                </div>
                <button
                  onClick={() =>
                    downloadDoc(
                      d.base64,
                      (d.kurz || `doc_${i + 1}`).replace(/\s+/g, "_")
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 border rounded px-3 py-2 bg-white hover:bg-gray-100"
                >
                  ⬇ Download
                </button>
              </div>
            ))
          ) : (
            // show three placeholders similar to your design
            <>
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm font-semibold mb-1">IPID Document</div>
                <div className="text-xs text-gray-500 mb-3">
                  Insurance Product Information Document
                </div>
                <button className="w-full inline-flex items-center justify-center gap-2 border rounded px-3 py-2 bg-white hover:bg-gray-100">
                  ⬇ Download
                </button>
              </div>
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm font-semibold mb-1">AVB Terms</div>
                <div className="text-xs text-gray-500 mb-3">
                  General Terms and Conditions
                </div>
                <button className="w-full inline-flex items-center justify-center gap-2 border rounded px-3 py-2 bg-white hover:bg-gray-100">
                  ⬇ Download
                </button>
              </div>
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="text-sm font-semibold mb-1">Info Sheet</div>
                <div className="text-xs text-gray-500 mb-3">
                  Product Information Sheet
                </div>
                <button className="w-full inline-flex items-center justify-center gap-2 border rounded px-3 py-2 bg-white hover:bg-gray-100">
                  ⬇ Download
                </button>
              </div>
            </>
          )}
        </div>

        {/* info and action buttons */}
        <div className="bg-primary/40 border border-blue-100 rounded p-4 mb-6 text-sm text-primary">
          Please review all documents carefully before proceeding with your
          application.
          <div className="mt-1 text-xs text-primary">
            The premium shown is based on the information you provided. Final
            premium will be confirmed upon application approval.
          </div>
        </div>

        <div className="flex gap-3 justify-center mb-6">
          <button
            className="px-6 py-2 rounded-full bg-primary text-white"
            onClick={() => router.push("/application")}
          >
            Proceed to Application
          </button>
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="px-6 py-3 rounded-full border font-medium"
          >
            Book an Appointment
          </button>
          <BookAppointmentModal
            open={showAppointmentModal}
            onClose={() => setShowAppointmentModal(false)}
          />{" "}
        </div>

        {/* What happens next */}
        <div className="border rounded-lg p-4 bg-purple-50 text-sm">
          <h4 className="font-semibold mb-2">What happens next?</h4>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Complete your application with contact details</li>
            <li>Review and submit your application</li>
            <li>Receive confirmation and policy documents via email</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
