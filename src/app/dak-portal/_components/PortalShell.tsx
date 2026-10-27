"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Bell,
  ChevronRight,
  CircleHelp,
  FileText,
  FolderOpen,
  LayoutGrid,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { api, applicationHref, BASE, fmtAgo } from "../_lib/client";
import CommandPalette from "./CommandPalette";
import { Avatar, initials } from "./ui";

const COLLAPSE_KEY = "dak-portal-sidebar-collapsed";
const NOTIFICATIONS_POLL_MS = 60_000;

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

export type ShellReviewer = { name: string; email: string; firstName: string; lastName: string };

const ReviewerContext = createContext<ShellReviewer>({ name: "", email: "", firstName: "", lastName: "" });

/** The signed-in reviewer, for pages inside the portal. */
export const useReviewer = () => useContext(ReviewerContext);

type NotificationItem = {
  id: string;
  applicationId: string;
  name: string;
  kind: "new_application" | "customer_response";
  createdAt: string;
  unread: boolean;
};

type NotificationSummary = { unread: number; needsAction: number; items: NotificationItem[] };

const MAIN_NAV: NavItem[] = [
  { href: `${BASE}/dashboard`, label: "Dashboard", icon: LayoutGrid },
  { href: `${BASE}/applications`, label: "Applications", icon: FileText },
  { href: `${BASE}/documents`, label: "Documents", icon: FolderOpen },
  { href: `${BASE}/activity-log`, label: "Activity Log", icon: Activity },
];

const SUPPORT_NAV: NavItem[] = [
  { href: `${BASE}/help`, label: "Help & Support", icon: CircleHelp },
  { href: `${BASE}/account`, label: "Account & Security", icon: UserRound },
];

const ALL_NAV = [...MAIN_NAV, ...SUPPORT_NAV];

/** Applications badge = applications waiting for the reviewer. */
const withBadges = (items: NavItem[], needsAction: number) =>
  items.map((item) => (item.href === `${BASE}/applications` && needsAction ? { ...item, badge: needsAction } : item));

const signOutOfPortal = () => signOut({ callbackUrl: `${BASE}/login` });

/* -------------------------------------------------------------------------- */
/*                                  SIDEBAR                                   */
/* -------------------------------------------------------------------------- */

function RailLink({ item, active, expanded }: { item: NavItem; active: boolean; expanded: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={expanded ? undefined : item.label}
      className={`group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500/30 ${
        active ? "text-violet-700" : "text-slate-500 hover:text-slate-900"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="dak-rail-active"
          className="absolute inset-0 rounded-xl bg-violet-50 ring-1 ring-violet-100"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          aria-hidden
        />
      ) : (
        <span className="absolute inset-0 rounded-xl transition-colors group-hover:bg-slate-100" aria-hidden />
      )}
      {active && (
        <motion.span
          layoutId="dak-rail-bar"
          className="absolute -left-3 top-2.5 h-6 w-1 rounded-r-full bg-violet-600"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          aria-hidden
        />
      )}

      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        <Icon className="h-[19px] w-[19px]" aria-hidden />
        {item.badge && !expanded ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {item.badge}
          </span>
        ) : null}
      </span>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="relative flex flex-1 items-center justify-between gap-2 whitespace-nowrap"
          >
            {item.label}
            {item.badge ? (
              <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {item.badge}
              </span>
            ) : null}
          </motion.span>
        )}
      </AnimatePresence>

      {/* tooltip when collapsed */}
      {!expanded && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}

function SignOutRail({ expanded }: { expanded: boolean }) {
  return (
    <button
      type="button"
      onClick={signOutOfPortal}
      aria-label={expanded ? undefined : "Sign out"}
      className="group relative flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-violet-500/30"
    >
      <LogOut className="h-[19px] w-[19px] shrink-0" aria-hidden />
      {expanded && <span className="whitespace-nowrap">Sign out</span>}
      {!expanded && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        >
          Sign out
        </span>
      )}
    </button>
  );
}

function Sidebar({
  pathname,
  expanded,
  onToggle,
  needsAction,
}: {
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
  needsAction: number;
}) {
  return (
    <motion.aside
      animate={{ width: expanded ? 256 : 76 }}
      transition={{ type: "spring", stiffness: 340, damping: 36 }}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200/70 bg-white/80 backdrop-blur-xl lg:flex"
    >
      {/* brand */}
      <div className="flex h-16 items-center gap-3 px-4">
        <Link href={`${BASE}/dashboard`} className="flex min-w-0 items-center gap-3" aria-label="InsurBe DAK Portal">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b2be2] to-[#5b21b6] shadow-md shadow-violet-500/30">
            <ShieldCheck className="h-5 w-5 text-white" aria-hidden />
          </span>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 whitespace-nowrap"
              >
                <span className="block text-[15px] font-semibold leading-tight text-slate-900">InsurBe</span>
                <span className="block text-[11px] text-slate-500">DAK Provider Portal</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* collapse / expand toggle, directly below the logo */}
      <div className="px-3 pt-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={expanded}
          className="group relative flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-violet-500/30"
        >
          {expanded ? <PanelLeftClose className="h-[19px] w-[19px] shrink-0" /> : <PanelLeftOpen className="h-[19px] w-[19px] shrink-0" />}
          {expanded && <span className="whitespace-nowrap">Collapse</span>}
          {!expanded && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-50 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            >
              Expand sidebar
            </span>
          )}
        </button>
        <div className="mt-2 h-px bg-slate-100" />
      </div>

      <nav aria-label="DAK portal" className="flex flex-1 flex-col gap-1 px-3 pt-3">
        {expanded && <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>}
        {withBadges(MAIN_NAV, needsAction).map((item) => (
          <RailLink key={item.href} item={item} active={pathname.startsWith(item.href)} expanded={expanded} />
        ))}

        <div className="my-3 h-px bg-slate-100" />
        {expanded && <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Support</p>}
        {SUPPORT_NAV.map((item) => (
          <RailLink key={item.href} item={item} active={pathname.startsWith(item.href)} expanded={expanded} />
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <SignOutRail expanded={expanded} />
      </div>
    </motion.aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TOP BAR                                   */
/* -------------------------------------------------------------------------- */

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

const popover = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
  transition: { duration: 0.15, ease: "easeOut" as const },
};

function Notifications({ summary, onOpen }: { summary: NotificationSummary | null; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useOutsideClose(open, close);
  const unread = summary?.unread ?? 0;
  const items = summary?.items ?? [];

  const toggle = () => {
    if (!open && unread) onOpen();
    setOpen((value) => !value);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            {...popover}
            className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              {unread > 0 && (
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                  {unread} new
                </span>
              )}
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</p>
            ) : (
              <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={applicationHref(item.applicationId)}
                      onClick={close}
                      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${item.unread ? "bg-violet-50/40" : ""}`}
                    >
                      <Avatar name={item.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-900">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-slate-500">
                            {" · "}
                            {item.kind === "new_application" ? "New application" : "Customer responded"}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.applicationId} · {fmtAgo(item.createdAt)}
                        </p>
                      </div>
                      {item.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" aria-label="New" />}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`${BASE}/activity-log`}
              onClick={close}
              className="flex items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-50/50"
            >
              View activity log <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileMenu({ reviewer }: { reviewer: ShellReviewer }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useOutsideClose(open, close);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-1 transition hover:bg-slate-100 sm:pr-3"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8b2be2] to-[#5b21b6] text-xs font-bold text-white">
          {initials(reviewer.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight text-slate-900">{reviewer.name}</span>
          <span className="block text-[11px] text-slate-500">DAK</span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            {...popover}
            className="absolute right-0 top-12 z-50 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-slate-900">{reviewer.name}</p>
              <p className="truncate text-xs text-slate-500">{reviewer.email}</p>
            </div>
            <div className="my-1 h-px bg-slate-100" />
            {[
              { href: `${BASE}/account`, label: "Account & Security", icon: UserRound },
              { href: `${BASE}/help`, label: "Help & Support", icon: CircleHelp },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                <Icon className="h-4 w-4 text-slate-400" aria-hidden /> {label}
              </Link>
            ))}
            <div className="my-1 h-px bg-slate-100" />
            <button
              type="button"
              onClick={signOutOfPortal}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                MOBILE NAV                                  */
/* -------------------------------------------------------------------------- */

function MobileNav({ pathname, needsAction }: { pathname: string; needsAction: number }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const moreActive = SUPPORT_NAV.some((item) => pathname.startsWith(item.href));

  useEffect(() => setMoreOpen(false), [pathname]);

  return (
    <>
      <nav
        aria-label="DAK portal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {withBadges(MAIN_NAV, needsAction).map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                    active ? "text-violet-700" : "text-slate-500"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dak-mobile-active"
                      className="absolute top-0 h-0.5 w-8 rounded-full bg-violet-600"
                      aria-hidden
                    />
                  )}
                  <span className="relative">
                    <Icon className="h-5 w-5" aria-hidden />
                    {item.badge ? (
                      <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                  {item.label.replace(" Log", "")}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              className={`flex w-full flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                moreActive ? "text-violet-700" : "text-slate-500"
              }`}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
              animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
              {SUPPORT_NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-[15px] font-medium text-slate-800 hover:bg-slate-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden />
                </Link>
              ))}
              <button
                type="button"
                onClick={signOutOfPortal}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-[15px] font-medium text-rose-600 hover:bg-rose-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <LogOut className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1">Sign out</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   SHELL                                    */
/* -------------------------------------------------------------------------- */

export default function PortalShell({ children, reviewer }: { children: ReactNode; reviewer: ShellReviewer }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);

  // New applications and customer replies; refreshed on navigation and every minute.
  const loadSummary = useCallback(() => {
    api<NotificationSummary>("/notifications")
      .then(setSummary)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary, pathname]);

  useEffect(() => {
    const timer = setInterval(loadSummary, NOTIFICATIONS_POLL_MS);
    return () => clearInterval(timer);
  }, [loadSummary]);

  const markNotificationsSeen = () => {
    api("/notifications", { method: "POST" })
      .then(() => setSummary((value) => (value ? { ...value, unread: 0 } : value)))
      .catch(() => undefined);
  };

  // Remember the sidebar state per browser (optional convenience).
  useEffect(() => {
    try {
      setExpanded(localStorage.getItem(COLLAPSE_KEY) === "expanded");
    } catch {
      // storage unavailable
    }
  }, []);

  const toggleSidebar = () =>
    setExpanded((value) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? "collapsed" : "expanded");
      } catch {
        // storage unavailable
      }
      return !value;
    });

  // Ctrl / Cmd + K opens the command palette.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const current = ALL_NAV.find((item) => pathname.startsWith(item.href));

  return (
    <div className="min-h-screen bg-[#f6f6fa] text-slate-900">
      {/* soft background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[380px] w-[380px] rounded-full bg-sky-100/40 blur-3xl" />
      </div>

      <Sidebar pathname={pathname} expanded={expanded} onToggle={toggleSidebar} needsAction={summary?.needsAction ?? 0} />

      <div
        className={`relative transition-[padding] duration-300 ease-out ${expanded ? "lg:pl-[256px]" : "lg:pl-[76px]"}`}
      >
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-[#f6f6fa]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Link href={`${BASE}/dashboard`} className="flex items-center gap-2 lg:hidden" aria-label="InsurBe DAK Portal">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b2be2] to-[#5b21b6]">
                <ShieldCheck className="h-4 w-4 text-white" aria-hidden />
              </span>
            </Link>

            <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm sm:flex">
              <span className="text-slate-400">DAK Portal</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden />
              <span className="font-medium text-slate-900">{current?.label ?? "Dashboard"}</span>
            </nav>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-600 sm:w-64"
                aria-label="Search"
              >
                <Search className="h-4 w-4" aria-hidden />
                <span className="hidden flex-1 text-left sm:block">Search…</span>
                <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:block">
                  Ctrl K
                </kbd>
              </button>
              <Notifications summary={summary} onOpen={markNotificationsSeen} />
              <ProfileMenu reviewer={reviewer} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          <motion.div
            key={pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ReviewerContext.Provider value={reviewer}>{children}</ReviewerContext.Provider>
          </motion.div>
        </main>
      </div>

      <MobileNav pathname={pathname} needsAction={summary?.needsAction ?? 0} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} nav={ALL_NAV} />
    </div>
  );
}
