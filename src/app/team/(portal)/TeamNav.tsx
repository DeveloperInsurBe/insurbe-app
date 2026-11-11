"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChart3, Briefcase, LogOut, Users, UsersRound } from "lucide-react";

const NAV = [
  { href: "/team/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/team/agents", label: "Agents", icon: Briefcase },
  { href: "/team/customers", label: "Customers", icon: Users },
];

export default function TeamNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-3 py-3 sm:px-5 lg:px-8">
        <Link href="/team/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white">
            <UsersRound className="h-[18px] w-[18px]" />
          </span>
          <span className="hidden sm:block">
            <span className="block text-[15px] font-black leading-tight text-gray-900">InsurBe</span>
            <span className="block text-[10px] font-bold uppercase tracking-[1.5px] text-[#820ad1]">Team portal</span>
          </span>
        </Link>

        <nav aria-label="Team portal" className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:ml-6 sm:w-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-[#820ad1]/10 text-[#820ad1]" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-right md:block">
            <span className="block text-xs font-bold text-gray-900">{name}</span>
            <span className="block text-[11px] text-gray-500">{email}</span>
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/team/login" })}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
