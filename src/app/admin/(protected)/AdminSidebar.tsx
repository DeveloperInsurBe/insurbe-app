"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  FileText,
  FolderOpen,
  LogOut,
  ReceiptText,
  Users,
  UserSquare2,
} from "lucide-react";

const menu = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/admin/partners",
    label: "Partners",
    icon: UserSquare2,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: FileText,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: ReceiptText,
  },
  {
    href: "/admin/mawsita",
    label: "Mawsita",
    icon: FolderOpen,
  },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 xl:sticky xl:top-0 xl:flex xl:h-screen xl:w-[280px] xl:min-w-[280px] xl:max-w-[280px] xl:shrink-0 xl:flex-col xl:border-b-0 xl:border-r">
      <div className="px-4 py-3 sm:px-5 sm:py-4 xl:px-6 xl:py-7">
        <p className="text-xs font-semibold uppercase tracking-[1.5px] text-[#820ad1]">
          InsurBe
        </p>
        <h2 className="mt-1 text-lg font-black text-gray-900 sm:text-xl">
          Admin Portal
        </h2>
      </div>

      <nav className="px-3 pb-3 sm:px-4 sm:pb-4 xl:flex-1 xl:px-5 xl:pb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] xl:grid xl:grid-cols-1 xl:gap-2 xl:overflow-visible xl:pb-0">
          {menu.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2.5 text-xs font-semibold transition-all sm:gap-3 sm:px-4 sm:py-3 sm:text-sm xl:w-full xl:rounded-xl ${
                  active
                    ? "bg-[#820ad1]/10 text-[#820ad1]"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-gray-100 px-3 py-3 sm:px-4 sm:py-4 xl:mt-auto xl:px-5">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:h-11 sm:text-sm"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
