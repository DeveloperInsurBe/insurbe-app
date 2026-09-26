"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  User,
  HelpCircle,
  Phone,
  Megaphone,
  LogOut,
  ShieldCheck,
  Euro,
  ArrowRight,
  Mail,
} from "lucide-react";

type PortalRole = "partner" | "agent";

type PortalUser = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
};

type PortalSidebarProps = {
  role: PortalRole;
  user: PortalUser;
};

const partnerMenu = [
  { name: "Partner Program", href: "/portal/dashboard", icon: LayoutDashboard },
  { name: "Conversions", href: "/portal/conversions-list", icon: BarChart3 },
  { name: "Partner Data", href: "/portal/partner-data", icon: User },
  { name: "Marketing Assets", href: "/portal/marketing-assets", icon: Megaphone },
  { name: "Documents", href: "/portal/documents", icon: FileText },
  { name: "FAQ", href: "/portal/faq-page", icon: HelpCircle },
  { name: "Contact", href: "/portal/contact", icon: Phone },
] as const;

const agentMenu = [
  { name: "Agent Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
  { name: "Agent Profile", href: "/portal/profile", icon: User },
  { name: "Verification", href: "/portal/verification", icon: ShieldCheck },
  { name: "Applications", href: "/portal/applications", icon: FileText },
  { name: "Commissions", href: "/portal/commissions", icon: Euro },
] as const;

// Prefetch every partner page in full (including server data), like the admin
// sidebar, so a click renders instantly instead of showing the loading skeleton.
// The content-only pages (assets, documents, FAQ, contact) cost no DB queries.
const fullPrefetchPartnerHrefs = new Set<string>(partnerMenu.map((item) => item.href));

type Highlight = { top: number; height: number; visible: boolean; animate: boolean };

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function PortalSidebar({ role, user }: PortalSidebarProps) {
  const pathname = usePathname();
  const menu = role === "partner" ? partnerMenu : agentMenu;
  const label = role === "partner" ? "Partner Portal" : "Agent Portal";
  const fullPrefetch = (href: string) =>
    role === "partner" && fullPrefetchPartnerHrefs.has(href);

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    (role === "partner" ? "Partner" : "Agent");

  const subtext = user?.email || "-";
  const subLabel = role === "partner" ? "Partner Account" : "Insurance Agent";
  const logoutUrl = `/partner-access/login?type=${role}`;

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // A background pill (same as the CreateApplicationModal rows) rests on the active
  // item, slides to whichever item is hovered / focused, and returns on leave.
  const listRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  const moveHighlightTo = useCallback((el: HTMLElement | null) => {
    const list = listRef.current;
    if (!list) return;
    if (!el) {
      setHighlight((h) => (h ? { ...h, visible: false } : h));
      return;
    }
    // offsetTop/offsetHeight ignore transforms, so the entrance animation
    // (items start 14px lower) can't misplace the pill. The list is the offsetParent.
    setHighlight((prev) => ({
      top: el.offsetTop,
      height: el.offsetHeight,
      visible: true,
      animate: prev !== null,
    }));
  }, []);

  const returnToActive = useCallback(() => {
    moveHighlightTo(listRef.current?.querySelector<HTMLElement>('[data-active="true"]') ?? null);
  }, [moveHighlightTo]);

  useIsomorphicLayoutEffect(() => {
    returnToActive();
  }, [pathname, returnToActive]);

  useEffect(() => {
    window.addEventListener("resize", returnToActive);
    return () => window.removeEventListener("resize", returnToActive);
  }, [returnToActive]);

  return (
    <>
      <div className="xl:hidden sticky top-0 z-40 border-b border-[#f0e6fb] bg-white/95 backdrop-blur-md">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <span className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white shadow-md shadow-[#820ad1]/25">
                <User size={18} />
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#820ad1]">
                {label}
              </p>
              <p className="truncate text-sm font-semibold text-gray-900" title={fullName}>
                {fullName}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: logoutUrl })}
            className="group shrink-0 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
          >
            <LogOut size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            Log Out
          </button>
        </div>

        <nav className="px-3 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={fullPrefetch(item.href) ? true : undefined}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-300 active:scale-95 ${
                    active
                      ? "bg-gradient-to-r from-[#faf7ff] to-[#f3e8ff] text-[#820ad1] ring-1 ring-[#e9d7ff]"
                      : "bg-gray-50 text-gray-600 hover:bg-[#faf7ff] hover:text-[#820ad1]"
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

      <aside className="hidden xl:flex w-[290px] shrink-0 bg-white border-r border-[#f0e6fb] flex-col justify-between">
        <div>
          {/* PROFILE CARD */}
          <div className="px-5 pt-6 pb-5 border-b border-[#f4ecfc]">
            <div
              className="modal-panel-in relative overflow-hidden rounded-[24px] border border-[#f0e6fb] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-4 shadow-[0_10px_30px_rgba(130,10,209,0.08)]"
            >
              {/* animated background shapes */}
              <div className="modal-float pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#820ad1]/10 blur-2xl" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: "radial-gradient(circle, #820ad1 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />

              <div className="relative flex items-center gap-3.5">
                <div className="modal-item-in relative h-14 w-14 shrink-0" style={{ animationDelay: "80ms" }}>
                  <span className="modal-ring absolute inset-0 rounded-2xl bg-[#820ad1]/25" />
                  <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white shadow-lg shadow-[#820ad1]/25">
                    <User size={26} />
                  </span>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    className="modal-item-in truncate text-base font-extrabold leading-tight text-[#111827]"
                    style={{ animationDelay: "140ms" }}
                    title={fullName}
                  >
                    {fullName}
                  </h2>
                  <span
                    className="modal-item-in mt-1.5 inline-flex max-w-full rounded-full border border-[#ead7ff] bg-[#f8f1ff] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[1.5px] text-[#820ad1]"
                    style={{ animationDelay: "200ms" }}
                  >
                    <span className="truncate">{subLabel}</span>
                  </span>
                </div>
              </div>

              <div
                className="modal-item-in relative mt-3.5 flex min-w-0 items-center gap-2 rounded-xl border border-[#efe3fb] bg-white/80 px-3 py-2 backdrop-blur"
                style={{ animationDelay: "260ms" }}
                title={subtext}
              >
                <Mail size={14} className="shrink-0 text-[#820ad1]" />
                <span className="truncate text-[13px] font-semibold text-[#820ad1]">{subtext}</span>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="p-4">
            <div
              ref={listRef}
              className="relative space-y-1"
              onMouseLeave={returnToActive}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) returnToActive();
              }}
            >
              {/* sliding highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 rounded-2xl bg-gradient-to-r from-[#faf7ff] to-[#f3e8ff] ring-1 ring-[#e9d7ff]"
                style={{
                  height: highlight?.height ?? 0,
                  transform: `translateY(${highlight?.top ?? 0}px)`,
                  opacity: highlight?.visible ? 1 : 0,
                  transition: highlight?.animate
                    ? "transform 320ms cubic-bezier(0.16,1,0.3,1), height 320ms cubic-bezier(0.16,1,0.3,1), opacity 200ms"
                    : "opacity 200ms",
                }}
              />

              {menu.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={fullPrefetch(item.href) ? true : undefined}
                    data-active={active ? "true" : undefined}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={(e) => moveHighlightTo(e.currentTarget)}
                    onFocus={(e) => moveHighlightTo(e.currentTarget)}
                    style={{ animationDelay: `${120 + index * 60}ms` }}
                    className={[
                      "modal-item-in group relative z-10 flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-transform active:scale-[0.99]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820ad1]/40",
                      active ? "text-[#820ad1]" : "text-gray-700",
                      // Before the pill is measured (first paint), show the active background directly.
                      active && !highlight ? "bg-[#820ad1]/10" : "",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:-rotate-3",
                        active
                          ? "bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-white shadow-md shadow-[#820ad1]/25"
                          : "border border-[#efe3fb] bg-white text-gray-500 shadow-sm group-hover:text-[#820ad1]",
                      ].join(" ")}
                    >
                      <Icon size={19} />
                    </span>

                    <span
                      className={`min-w-0 flex-1 truncate text-[15px] ${
                        active ? "font-bold" : "font-medium group-hover:text-[#111827]"
                      }`}
                    >
                      {item.name}
                    </span>

                    <span
                      className={[
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                        active
                          ? "border-[#e9d7ff] bg-white text-[#820ad1] opacity-100"
                          : "border-[#e9d7ff] bg-white text-[#820ad1] opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 group-hover:border-transparent group-hover:bg-[#820ad1] group-hover:text-white",
                      ].join(" ")}
                    >
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#f4ecfc]">
          <button
            onClick={() => signOut({ callbackUrl: logoutUrl })}
            className="group flex w-full cursor-pointer items-center gap-3.5 rounded-2xl px-3 py-2.5 text-gray-500 transition-all hover:bg-red-50 hover:text-red-500"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white transition-all duration-300 group-hover:border-red-200 group-hover:-rotate-3">
              <LogOut size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
            <span className="text-[15px] font-medium">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
