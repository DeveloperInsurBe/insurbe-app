"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { getPlanDocumentsByPlanId } from "./planDocuments";

interface DownloadPlan {
  id: string;
  name: string;
}

interface PlanDocumentDownloadsProps {
  plans: DownloadPlan[];
}

export default function PlanDocumentDownloads({
  plans,
}: PlanDocumentDownloadsProps) {
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const downloadablePlans = useMemo(() => {
    return plans
      .map((plan) => ({
        ...plan,
        documents: getPlanDocumentsByPlanId(plan.id),
      }))
      .filter((plan) => plan.documents.length > 0);
  }, [plans]);

  if (downloadablePlans.length === 0) return null;

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      setErrorMessage(null);
      setDownloadingDocId(documentId);

      const response = await fetch(`/api/coverage-documents/${documentId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download document");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = fileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Coverage document download failed:", error);
      setErrorMessage("Unable to download right now. Please try again.");
    } finally {
      setDownloadingDocId(null);
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-purple-200 bg-white p-5 shadow-lg sm:p-6">
      <div className="mb-5">
        <h3 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
          Download Coverage Documents
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Download plan documents directly from InsurBe.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {downloadablePlans.map((plan) => (
          <section
            key={plan.id}
            className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-4 sm:p-5"
          >
            <h4 className="mb-3 text-base font-bold text-gray-900 sm:text-lg">
              {plan.name}
            </h4>

            <div className="space-y-2.5">
              {plan.documents.map((document) => {
                const isDownloading = downloadingDocId === document.id;

                return (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => handleDownload(document.id, document.fileName)}
                    disabled={isDownloading}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-purple-200 bg-white px-4 py-3 text-left transition hover:border-purple-300 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="text-sm font-semibold text-gray-900 sm:text-base">
                      {document.title}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-700">
                      <Download className="h-4 w-4" />
                      {isDownloading ? "Downloading..." : "Download"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

