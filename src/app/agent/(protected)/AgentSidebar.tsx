"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  User,
  ShieldCheck,
  Users,
  FileText,
  Euro,
} from "lucide-react";

type AgentSidebarProps = {
  agent: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
};

const menu = [
  {
    name: "Agent Dashboard",
    href: "/agent/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Agent Profile",
    href: "/agent/profile",
    icon: User,
  },
  {
    name: "Verification",
    href: "/agent/verification",
    icon: ShieldCheck,
  },
  {
    name: "Clients",
    href: "/agent/clients",
    icon: Users,
  },
  {
    name: "Applications",
    href: "/agent/applications",
    icon: FileText,
  },
  {
    name: "Commissions",
    href: "/agent/commissions",
    icon: Euro,
  },
] as const;

export default function AgentSidebar({ agent }: AgentSidebarProps) {
  const pathname = usePathname();
  const fullName =
    `${agent?.firstName || ""} ${agent?.lastName || ""}`.trim() || "Agent";

  return (
    <>
      <div className="xl:hidden sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[1.4px] text-gray-500">
              Agent Portal
            </p>
            <p className="truncate text-sm font-semibold text-gray-900">{fullName}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>

        <nav className="px-3 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {menu.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    active
                      ? "bg-[#820ad1]/12 text-[#820ad1]"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={14} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <aside className="hidden xl:flex w-[290px] bg-white border-r border-gray-200 flex-col justify-between">
        <div>
          <div className="px-6 pt-8 pb-7 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#820ad1]/20 to-[#820ad1]/5 border border-[#820ad1]/10 flex items-center justify-center shadow-sm">
                  <User size={34} className="text-[#820ad1]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-white" />
              </div>

              <div className="flex flex-col">
                <h2 className="text-[18px] font-semibold text-gray-900 leading-none">
                  {fullName}
                </h2>
                <p className="text-sm text-gray-500 mt-2">Insurance Agent</p>
                <p className="text-[#820ad1] font-semibold text-sm tracking-wide">
                  {agent?.email || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
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
    </>
  );
}
