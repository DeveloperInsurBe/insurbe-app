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
  LogOut,
} from "lucide-react";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menu = [
    {
      name: "Partner Program",
      href: "/partner/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Conversions",
      href: "/partner/conversions-list",
      icon: BarChart3,
    },
    {
      name: "Study Eligibility",
      href: "/partner/study-eligibility",
      icon: BookOpen,
    },
    {
      name: "Partner Data",
      href: "/partner/partner-data",
      icon: User,
    },
    {
      name: "Marketing Assets",
      href: "/partner/marketing-assets",
      icon: Megaphone,
    },
    {
      name: "Documents",
      href: "/partner/documents",
      icon: FileText,
    },
    {
      name: "FAQ",
      href: "/partner/faq-page",
      icon: HelpCircle,
    },
    {
      name: "Contact",
      href: "/partner/contact",
      icon: Phone,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      {/* HEADER */}
      <header className="h-[78px] bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-[30px] font-black tracking-tight">
            Insur<span className="text-[#820ad1]">Be</span>
          </h1>

          <div className="h-7 w-[1px] bg-gray-300" />

          <p className="text-[#820ad1] font-semibold tracking-wide text-lg">
            PARTNER PORTAL
          </p>
        </div>

        <button className="text-[#820ad1] font-medium hover:underline text-sm">
          To InsurBe Homepage
        </button>
      </header>

      {/* BODY */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="w-[290px] bg-white border-r border-gray-200 flex flex-col justify-between">
          <div>
            {/* PROFILE */}
            <div className="px-6 pt-8 pb-7 border-b border-gray-100">
              <div className="flex items-center gap-4">
                {/* AVATAR */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#820ad1]/20 to-[#820ad1]/5 border border-[#820ad1]/10 flex items-center justify-center shadow-sm">
                    <User size={34} className="text-[#820ad1]" />
                  </div>

                  {/* ONLINE DOT */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-white" />
                </div>

                {/* USER INFO */}
                <div className="flex flex-col">
                  <h2 className="text-[18px] font-semibold text-gray-900 leading-none">
                    Dalip Kumar
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">Partner ID</p>

                  <p className="text-[#820ad1] font-semibold text-sm tracking-wide">
                    #1393797
                  </p>
                </div>
              </div>
            </div>

            {/* MENU */}
            <div className="p-5 space-y-2">
              {menu.map((item) => {
                const Icon = item.icon;

                const active = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 ${
                      active
                        ? "bg-[#820ad1]/10 text-[#820ad1]"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={22}
                      className={`${
                        active
                          ? "text-[#820ad1]"
                          : "text-gray-500 group-hover:text-[#820ad1]"
                      }`}
                    />

                    <span className="text-[17px] font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* LOGOUT */}
          <div className="p-5 border-t border-gray-100">
            <button className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-all px-4 py-3">
              <LogOut size={20} />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </aside>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
