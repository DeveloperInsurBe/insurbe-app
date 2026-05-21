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
import { signOut } from "next-auth/react";

type PartnerSidebarProps = {
  partner: any;
};

export default function PartnerSidebar({ partner }: PartnerSidebarProps) {
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
    <aside className="hidden xl:flex w-[290px] bg-white border-r border-gray-200 flex-col justify-between">
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
                {partner?.firstName} {partner?.lastName}
              </h2>

              <p className="text-sm text-gray-500 mt-2">Partner ID</p>

              <p className="text-[#820ad1] font-semibold text-sm tracking-wide">
                #{partner?.partnerId}
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
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-all px-4 py-3"
        >
          <LogOut size={20} />

          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
