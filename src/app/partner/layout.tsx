"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  User,
  BookOpen,
  HelpCircle,
  Phone,
  Megaphone,
} from "lucide-react";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menu = [
    { name: "Partner Program", href: "/partner/dashboard", icon: LayoutDashboard },
    { name: "Conversions", href: "/partner/conversions-list", icon: BarChart3 },
    { name: "Study Eligibility", href: "/partner/study-eligibility", icon: BookOpen },
    { name: "Partner Data", href: "/partner/partner-data", icon: User },
    { name: "Marketing Assets", href: "/partner/marketing-assets", icon: Megaphone },
    { name: "Documents", href: "/partner/documents", icon: FileText },
    { name: "FAQ", href: "/partner/faq-page", icon: HelpCircle },
    { name: "Contact", href: "/partner/contact", icon: Phone },
  ];

return (
  <div className="min-h-screen bg-[#f7f9f8] flex flex-col">

    {/* TOP HEADER */}
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold">InsurBe</span>
        <span className="text-[#820ad1] font-semibold text-sm">
          PARTNER PORTAL
        </span>
      </div>

      <button className="text-[#820ad1] text-sm font-medium">
        To InsurBe Homepage
      </button>
    </div>

    {/* MAIN BODY */}
    <div className="flex flex-1">

      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r p-5 flex flex-col justify-between">

        {/* PROFILE */}
        <div>
          <div className="mb-8">
            <div className="w-14 h-14 rounded-full bg-gray-200 mb-3" />
            <p className="font-semibold">Dalip Kumar</p>
            <p className="text-sm text-gray-500">Partner id: 1393797</p>
          </div>

          {/* MENU */}
          <div className="space-y-2">
            <a href="/partner/dashboard" className="block p-2 rounded hover:bg-gray-100">Partner Program</a>
            <a href="/partner/conversions-list" className="block p-2 rounded hover:bg-gray-100">Conversions</a>
            <a href="/partner/study-eligibility" className="block p-2 rounded hover:bg-gray-100">Study Eligibility</a>
            <a href="/partner/partner-data" className="block p-2 rounded hover:bg-gray-100">Partner Data</a>
            <a href="/partner/marketing-assets" className="block p-2 rounded hover:bg-gray-100">Marketing Assets</a>
            <a href="/partner/documents" className="block p-2 rounded hover:bg-gray-100">Documents</a>
            <a href="/partner/faq-page" className="block p-2 rounded hover:bg-gray-100">FAQ</a>
            <a href="/partner/contact" className="block p-2 rounded hover:bg-gray-100">Contact</a>
          </div>
        </div>

        {/* LOGOUT */}
        <button className="text-left text-gray-600 hover:text-red-500">
          Log Out
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  </div>
);
}