"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Download, Home, Mail, FileText, Phone } from "lucide-react";

interface ApplicationDetails {
  name: string;
  email: string;
  phone: string;
  dob: string;
  coverageStart: string;
}

export default function ApplicationSuccess() {
  const router = useRouter();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("application.pdf");
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null);
  const [referenceNumber] = useState(() => `REF-${Date.now().toString(36).toUpperCase()}`);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get PDF from sessionStorage
    const storedBase64 = sessionStorage.getItem("applicationPdfBase64");
    const storedFilename = sessionStorage.getItem("applicationPdfFilename");
    const storedDetails = sessionStorage.getItem("applicationDetails");

    console.log("✓ Page loaded");
    console.log("✓ Has PDF:", !!storedBase64);
    console.log("✓ Has Details:", !!storedDetails);

    if (storedBase64) {
      setPdfBase64(storedBase64);
      console.log("✓ PDF data loaded successfully");
    }

    if (storedFilename) {
      setPdfFilename(storedFilename);
    }

    if (storedDetails) {
      try {
        setApplicationDetails(JSON.parse(storedDetails) as ApplicationDetails);
      } catch (e) {
        console.error("Error parsing application details:", e);
      }
    }

    setIsLoading(false);
  }, []);

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64: string): Blob => {
    // Remove data URL prefix if present
    const base64Data = base64.split(',')[1] || base64;
    
    // Decode base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/pdf' });
  };

  const handleDownloadPdf = () => {
    if (!pdfBase64) {
      setDownloadError("PDF not available. Please contact support.");
      console.error("PDF data is null");
      return;
    }

    try {
      console.log("🔄 Starting PDF download...");
      
      // Convert base64 to blob
      const blob = base64ToBlob(pdfBase64);
      console.log("✓ Blob created:", blob.size, "bytes");
      
      // Create blob URL
      const blobUrl = URL.createObjectURL(blob);
      console.log("✓ Blob URL created:", blobUrl);
      
      // Create link element
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = pdfFilename;
      
      // Append to body (required for some browsers)
      document.body.appendChild(link);
      
      // Trigger click
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        console.log("✓ Download completed and cleaned up");
      }, 100);
      
      setDownloadError(null);
    } catch (error) {
      console.error("❌ Download error:", error);
      setDownloadError("Failed to download PDF. Please try again or contact support.");
    }
  };

  const handleGoHome = () => {
    // Clear sessionStorage
    sessionStorage.removeItem("applicationPdf");
    sessionStorage.removeItem("applicationPdfBase64");
    sessionStorage.removeItem("applicationPdfFilename");
    sessionStorage.removeItem("applicationDetails");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 flex items-center justify-center">
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
        {/* Success Message Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully! 🎉
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Thank you for choosing <span className="font-semibold text-primary">MAWISTA Expat</span>.
            Your application has been received and is being processed.
          </p>

          {/* Reference Number */}
          <div className="inline-block bg-primary/10 border-2 border-primary/30 rounded-lg px-6 py-3 mb-8">
            <p className="text-sm text-gray-600 mb-1">Your Reference Number</p>
            <p className="text-2xl font-mono font-bold text-primary">{referenceNumber}</p>
            <p className="text-xs text-gray-500 mt-1">Please save this for your records</p>
          </div>

          {/* Application Details */}
          {applicationDetails && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Application Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Applicant Name</p>
                    <p className="font-medium text-gray-900">{applicationDetails.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{applicationDetails.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{applicationDetails.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Coverage Start</p>
                    <p className="font-medium text-gray-900">{applicationDetails.coverageStart}</p>
                  </div>
                </div>
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
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Email Confirmation</h4>
                  <p className="text-sm text-gray-600">You&apos;ll receive a confirmation email within the next few minutes</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Application Review</h4>
                  <p className="text-sm text-gray-600">Our team will process your application within 24-48 hours</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Policy Documents</h4>
                  <p className="text-sm text-gray-600">You&apos;ll receive your policy number and documents via email</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Coverage Begins</h4>
                  <p className="text-sm text-gray-600">Your coverage starts on your selected date</p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Error */}
          {downloadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 max-w-2xl mx-auto">
              {downloadError}
            </div>
          )}

          {/* Download Button */}
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
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Information</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>You can cancel your policy within 14 days for a full refund</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Keep your reference number safe for any future correspondence</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Download and save your application PDF for your records</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Check your email (including spam folder) for confirmation</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

        {/* Need Help Section */}
        <div className="text-center mt-12 bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Our customer support team is available 24/7 to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:support@mawista.com"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="w-5 h-5" />
              support@mawista.com
            </a>
            <span className="hidden sm:block text-gray-300">|</span>
            <a
              href="tel:+4912345678"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Phone className="w-5 h-5" />
              +49 123 456 7890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
