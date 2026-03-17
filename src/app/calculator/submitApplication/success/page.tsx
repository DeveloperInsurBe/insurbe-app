"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Download,
  Home,
  Mail,
  FileText,
  Phone,
} from "lucide-react";

interface ApplicationDetails {
  name: string;
  email: string;
  phone: string;
  dob: string;
  coverageStart: string;
  tariffId?: string[];
}

export default function ApplicationSuccess() {
  const router = useRouter();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("application.pdf");
  const [applicationDetails, setApplicationDetails] =
    useState<ApplicationDetails | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedBase64 = sessionStorage.getItem("applicationPdfBase64");
    const storedFilename = sessionStorage.getItem("applicationPdfFilename");
    const storedDetails = sessionStorage.getItem("applicationDetails");
    const orderId = sessionStorage.getItem("applicationOrderId");
    setReferenceNumber(orderId || "—");
    console.log("✓ Page loaded");
    console.log("✓ Has PDF:", !!storedBase64);
    console.log("✓ Has Details:", !!storedDetails);

    if (storedBase64) setPdfBase64(storedBase64);
    if (storedFilename) setPdfFilename(storedFilename);

    if (storedDetails) {
      try {
        setApplicationDetails(JSON.parse(storedDetails) as ApplicationDetails);
      } catch (e) {
        console.error("Error parsing application details:", e);
      }
    }

    setIsLoading(false);
  }, []);

  const base64ToBlob = (base64: string): Blob => {
    const base64Data = base64.split(",")[1] || base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
  };

  const handleDownloadPdf = () => {
    if (!pdfBase64) {
      setDownloadError("PDF not available. Please contact support.");
      return;
    }
    try {
      const blob = base64ToBlob(pdfBase64);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      setDownloadError(null);
    } catch (error) {
      console.error("❌ Download error:", error);
      setDownloadError("Failed to download PDF. Please try again.");
    }
  };

  const handleGoHome = () => {
    sessionStorage.removeItem("applicationPdfBase64");
    sessionStorage.removeItem("applicationPdfFilename");
    sessionStorage.removeItem("applicationDetails");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully! 🎉
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your application has been received and is being processed.
          </p>

          {/* Reference Number */}
          <div className="inline-block bg-primary/10 border-2 border-primary/30 rounded-lg px-6 py-3 mb-8">
            <p className="text-sm text-gray-600 mb-1">Your Reference Number</p>
            <p className="text-2xl font-mono font-bold text-primary">
              {referenceNumber}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Please save this for your records
            </p>
          </div>

          {/* Application Details — only shown if data exists */}
          {applicationDetails && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                Application Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {applicationDetails.name && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Applicant Name</p>
                      <p className="font-medium text-gray-900">
                        {applicationDetails.name}
                      </p>
                    </div>
                  </div>
                )}
                {applicationDetails.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {applicationDetails.email}
                      </p>
                    </div>
                  </div>
                )}
                {applicationDetails.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">
                        {applicationDetails.phone}
                      </p>
                    </div>
                  </div>
                )}
                {applicationDetails.coverageStart && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Coverage Start</p>
                      <p className="font-medium text-gray-900">
                        {applicationDetails.coverageStart}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 md:p-8 mb-8 max-w-3xl mx-auto">
            <h3 className="font-semibold text-xl text-gray-900 mb-6 flex items-center justify-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              What Happens Next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {[
                // {
                //   step: 1,
                //   title: "Email Confirmation",
                //   desc: "You'll receive a confirmation email within the next few minutes",
                // },
                // {
                //   step: 2,
                //   title: "Application Review",
                //   desc: "Our team will process your application within 24-48 hours",
                // },
                // {
                //   step: 3,
                //   title: "Policy Documents",
                //   desc: "You'll receive your policy number and documents via email",
                // },
                // {
                //   step: 4,
                //   title: "Coverage Begins",
                //   desc: `Your coverage starts on ${applicationDetails?.coverageStart || "your selected date"}`,
                // },
                {
                  step: 1,
                  title: "Download & Sign PDF",
                  desc: "Download your application PDF and sign it",
                },
                {
                  step: 2,
                  title: "Send to Hallesche",
                  desc: "Send the signed document to Hallesche by post or email",
                },
                {
                  step: 3,
                  title: "Policy Review",
                  desc: "Hallesche reviews your application (typically 2-5 business days)",
                },
                {
                  step: 4,
                  title: "Policy Issued",
                  desc: `Your coverage starts on ${applicationDetails?.coverageStart || "your selected date"} once approved`,
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {title}
                    </h4>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download error */}
          {downloadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 max-w-2xl mx-auto">
              {downloadError}
            </div>
          )}

          {/* PDF Download or fallback */}
          {pdfBase64 ? (
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl mb-6"
            >
              <Download className="w-5 h-5" />
              Download Application PDF
            </button>
          ) : (
            <div className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-3 rounded-lg mb-6">
              <p className="text-sm">PDF will be sent to your email shortly</p>
            </div>
          )}
        </div>

        {/* Important Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Important Information
          </h3>
          <ul className="space-y-3 text-gray-700">
            {[
              "You can cancel your policy within 14 days for a full refund",
              "Keep your reference number safe for any future correspondence",
              "Download and save your application PDF for your records",
              "Check your email (including spam folder) for confirmation",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-200"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={() => router.push("/support")}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-200"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
