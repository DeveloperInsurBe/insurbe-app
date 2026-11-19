"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ChevronsLeft, LogOut, Mail, Menu, X, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

const EASE = [0.22, 1, 0.36, 1] as const;

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

type Tip = { label: string; caption?: string; current?: boolean; top: number; left: number };

type TipHandlers = {
  showTip: (event: { currentTarget: Element }, tip: Omit<Tip, "top" | "left">) => void;
  hideTip: () => void;
};

/**
 * Tooltip for the icon-only sidebar. Rendered in a portal with fixed
 * positioning so it never affects the sidebar's scroll area.
 */
function SidebarTooltip({ tip }: { tip: Tip | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {tip ? (
        <motion.div
          key={tip.label}
          role="tooltip"
          className="pointer-events-none fixed z-[70]"
          style={{ top: tip.top, left: tip.left, y: "-50%" }}
          initial={{ opacity: 0, x: -6, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: EASE }}
        >
          <div className="relative overflow-hidden whitespace-nowrap rounded-xl border border-[#820ad1]/15 bg-white py-2 pl-3.5 pr-3 shadow-lg shadow-[#820ad1]/15">
            {/* accent bar */}
            <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#820ad1] to-[#a855f7]" />
            {tip.caption ? (
              <p
                className={`text-[10px] font-bold text-[#820ad1] ${
                  tip.caption.includes("@") ? "" : "uppercase tracking-[1.2px]"
                }`}
              >
                {tip.caption}
              </p>
            ) : null}
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-900">
              {tip.label}
              {tip.current ? (
                <span className="rounded-full bg-[#820ad1]/10 px-1.5 py-px text-[10px] font-semibold text-[#820ad1]">
                  Current
                </span>
              ) : null}
            </p>
          </div>
          {/* arrow: joins the purple accent bar */}
          <span className="absolute -left-[4px] top-1/2 z-10 h-2.5 w-2.5 -translate-y-1/2 rotate-45 rounded-[2px] bg-[#820ad1]" />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

type PortalConfig = {
  /** Small purple caption under "InsurBe", e.g. "Sales Leader". */
  brandLabel: string;
  homeHref: string;
  groups: NavGroup[];
  logoutUrl: string;
  /** localStorage key for the collapsed state. */
  storageKey: string;
  /** Partner / agent portals keep their frosted-glass look (translucent, blurred, purple tints). */
  glass?: boolean;
};

function Brand({ collapsed, config }: { collapsed: boolean; config: PortalConfig }) {
  return (
    <Link href={config.homeHref} className="flex min-w-0 items-center gap-2.5">
      <Image
        src="/insurbe-mark.svg"
        alt="InsurBe"
        width={36}
        height={36}
        priority
        unoptimized
        className="h-9 w-9 shrink-0 rounded-xl shadow-md shadow-[#820ad1]/25"
      />
      {collapsed ? null : (
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-black leading-tight text-gray-900">
            InsurBe
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-[1.5px] text-[#820ad1]">
            {config.brandLabel}
          </span>
        </span>
      )}
    </Link>
  );
}

function SidebarBody({
  config,
  collapsed,
  name,
  email,
  indicatorId,
  onNavigate,
  showTip,
  hideTip,
}: TipHandlers & {
  config: PortalConfig;
  collapsed: boolean;
  name: string;
  email: string;
  /** Separate ids so the drawer and desktop indicators don't animate into each other */
  indicatorId: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  // Glass look: one pill sits on the active item, slides to the hovered item and
  // returns on leave (the partner portal's original hover effect).
  const [hovered, setHovered] = useState<string | null>(null);
  const activeHref = config.groups.flatMap((group) => group.items).find((item) => isActive(pathname, item.href))?.href;
  const pillHref = config.glass && !collapsed ? (hovered ?? activeHref) : activeHref;

  return (
    <>
      <nav
        onScroll={hideTip}
        onMouseLeave={() => setHovered(null)}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin"
      >
        {config.glass && !collapsed && email ? (
          <div
            className="mb-4 flex min-w-0 items-center gap-2 rounded-xl border border-[#efe3fb] bg-white/80 px-3 py-2 backdrop-blur"
            title={email}
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-[#820ad1]" />
            <span className="truncate text-[13px] font-semibold text-[#820ad1]">{email}</span>
          </div>
        ) : null}

        {config.groups.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-gray-200" />
            ) : (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400">
                {group.label}
              </p>
            )}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      onClick={() => {
                        hideTip();
                        onNavigate?.();
                      }}
                      aria-current={active ? "page" : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      onMouseEnter={(event) => {
                        if (collapsed) showTip(event, { label: item.label, caption: group.label, current: active });
                        else setHovered(item.href);
                      }}
                      onFocus={(event) => {
                        if (collapsed) showTip(event, { label: item.label, caption: group.label, current: active });
                        else setHovered(item.href);
                      }}
                      onMouseLeave={collapsed ? hideTip : undefined}
                      onBlur={collapsed ? hideTip : undefined}
                      className={`group relative flex h-10 items-center gap-3 rounded-xl text-sm font-semibold transition-colors ${
                        collapsed ? "justify-center px-0" : "px-3"
                      } ${
                        active
                          ? "text-[#820ad1]"
                          : config.glass
                            ? "text-gray-600 hover:text-[#820ad1]"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {item.href === pillHref ? (
                        <motion.span
                          layoutId={indicatorId}
                          className={`absolute inset-0 rounded-xl ${
                            config.glass
                              ? "bg-gradient-to-r from-[#faf7ff] to-[#f3e8ff] ring-1 ring-[#e9d7ff]"
                              : "bg-[#820ad1]/10"
                          }`}
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        >
                          {active ? (
                            <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#820ad1]" />
                          ) : null}
                        </motion.span>
                      ) : null}
                      <Icon
                        className={`relative h-[18px] w-[18px] shrink-0 ${
                          config.glass ? "transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" : ""
                        }`}
                      />
                      {collapsed ? null : <span className="relative truncate">{item.label}</span>}
                    </Link>

                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        {collapsed ? (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: config.logoutUrl })}
            aria-label="Log out"
            onMouseEnter={(event) => showTip(event, { label: "Log out", caption: email })}
            onFocus={(event) => showTip(event, { label: "Log out", caption: email })}
            onMouseLeave={hideTip}
            onBlur={hideTip}
            className="flex h-10 w-full items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        ) : (
          <div
            className={`flex items-center gap-2.5 rounded-xl p-2.5 ${
              config.glass ? "bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] ring-1 ring-[#f0e6fb]" : "bg-gray-50"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#820ad1]/10 text-sm font-black uppercase text-[#820ad1]">
              {name.charAt(0) || email.charAt(0) || "S"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-gray-900">{name}</span>
              <span className="block truncate text-[11px] text-gray-500" title={email}>
                {email}
              </span>
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: config.logoutUrl })}
              aria-label="Log out"
              title="Log out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Shared sidebar of the Sales Leader, partner and agent portals (same look
 * and behaviour as the admin sidebar): fixed on desktop, collapsible to icons,
 * a drawer with a top bar on smaller screens.
 */
export default function PortalNav({ name, email, ...config }: PortalConfig & { name: string; email: string }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  const showTip: TipHandlers["showTip"] = (event, next) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTip({ ...next, top: rect.top + rect.height / 2, left: rect.right + 14 });
  };
  const hideTip = () => setTip(null);

  const current = config.groups.flatMap((group) => group.items).find((item) =>
    isActive(pathname, item.href),
  );

  // Remember the desktop collapsed state per browser.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(config.storageKey) === "1");
    } catch {
      // storage unavailable: keep expanded
    }
  }, [config.storageKey]);

  const toggleCollapsed = () => {
    setTip(null);
    setCollapsed((value) => {
      try {
        localStorage.setItem(config.storageKey, value ? "0" : "1");
      } catch {
        // ignore
      }
      return !value;
    });
  };

  // Drawer: Esc to close, lock page scroll while open.
  useEffect(() => {
    if (!drawerOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <MotionConfig reducedMotion="user">
      {/* MOBILE / TABLET TOP BAR */}
      <header
        className={`sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-3 backdrop-blur sm:px-5 xl:hidden ${
          config.glass ? "border-[#f0e6fb] bg-white/70 backdrop-blur-xl" : "border-gray-200 bg-white/90 supports-[backdrop-filter]:bg-white/75"
        }`}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Brand collapsed config={config} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">
            {current?.label ?? config.brandLabel}
          </p>
        </div>

        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#820ad1]/10 text-sm font-black uppercase text-[#820ad1]"
          title={email}
        >
          {name.charAt(0) || email.charAt(0) || "S"}
        </span>
      </header>

      {/* MOBILE / TABLET DRAWER */}
      <AnimatePresence>
        {drawerOpen ? (
          <div className="fixed inset-0 z-50 xl:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={`${config.brandLabel} navigation`}
              className={`absolute inset-y-0 left-0 flex w-[min(19rem,85vw)] flex-col shadow-2xl ${
                config.glass ? "bg-white/85 backdrop-blur-xl" : "bg-white"
              }`}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="flex h-16 items-center justify-between gap-3 border-b border-gray-100 px-4">
                <Brand collapsed={false} config={config} />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarBody
                config={config}
                collapsed={false}
                name={name}
                email={email}
                indicatorId="portal-nav-drawer"
                onNavigate={() => setDrawerOpen(false)}
                showTip={showTip}
                hideTip={hideTip}
              />
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <motion.aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r xl:flex ${
          config.glass
            ? "border-[#f0e6fb] bg-white/70 shadow-[0_10px_30px_rgba(130,10,209,0.06)] backdrop-blur-xl"
            : "border-gray-200 bg-white"
        }`}
        initial={false}
        animate={{ width: collapsed ? 76 : 264 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        <div
          className={`flex h-16 items-center border-b border-gray-100 ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <Brand collapsed={collapsed} config={config} />
          {collapsed ? null : (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            onMouseEnter={(event) => showTip(event, { label: "Expand sidebar" })}
            onFocus={(event) => showTip(event, { label: "Expand sidebar" })}
            onMouseLeave={hideTip}
            onBlur={hideTip}
            className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronsLeft className="h-4 w-4 rotate-180" />
          </button>
        ) : null}

        <SidebarBody
          config={config}
          collapsed={collapsed}
          name={name}
          email={email}
          indicatorId="portal-nav-desktop"
          showTip={showTip}
          hideTip={hideTip}
        />

        <SidebarTooltip tip={collapsed ? tip : null} />
      </motion.aside>
    </MotionConfig>
  );
}
