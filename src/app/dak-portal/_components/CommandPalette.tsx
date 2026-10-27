"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CornerDownLeft, FileText, Search, type LucideIcon } from "lucide-react";

import { api, applicationHref, type DakListRow } from "../_lib/client";
import { Avatar, StatusBadge } from "./ui";

export type PaletteNavItem = { href: string; label: string; icon: LucideIcon };

type Item =
  | { kind: "page"; id: string; label: string; href: string; icon: LucideIcon }
  | { kind: "app"; id: string; label: string; href: string; app: DakListRow };

export default function CommandPalette({
  open,
  onClose,
  nav,
}: {
  open: boolean;
  onClose: () => void;
  nav: PaletteNavItem[];
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [applications, setApplications] = useState<DakListRow[]>([]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const pages: Item[] = nav
      .filter((item) => !q || item.label.toLowerCase().includes(q))
      .map((item) => ({ kind: "page", id: item.href, label: item.label, href: item.href, icon: item.icon }));
    const apps: Item[] = applications
      .filter(
        (app) =>
          !q || app.name.toLowerCase().includes(q) || app.id.toLowerCase().includes(q) || app.email.toLowerCase().includes(q),
      )
      .slice(0, 6)
      .map((app) => ({ kind: "app", id: app.id, label: app.name, href: applicationHref(app.id), app }));
    return [...pages, ...apps];
  }, [query, nav, applications]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    api<{ applications: DakListRow[] }>("/applications")
      .then((data) => setApplications(data.applications))
      .catch(() => undefined);
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const go = (item: Item) => {
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && items[active]) {
      event.preventDefault();
      go(items[active]);
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  const pages = items.filter((item) => item.kind === "page");
  const apps = items.filter((item) => item.kind === "app");

  const renderItem = (item: Item) => {
    const index = items.indexOf(item);
    const isActive = index === active;
    return (
      <li key={`${item.kind}-${item.id}`}>
        <button
          type="button"
          onMouseEnter={() => setActive(index)}
          onClick={() => go(item)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
            isActive ? "bg-violet-50 text-violet-900" : "text-slate-700"
          }`}
        >
          {item.kind === "page" ? (
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-white text-violet-700" : "bg-slate-100 text-slate-500"}`}>
              <item.icon className="h-4 w-4" aria-hidden />
            </span>
          ) : (
            <Avatar name={item.app.name} size="sm" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{item.label}</span>
            {item.kind === "app" && <span className="block text-xs text-slate-500">{item.app.id}</span>}
          </span>
          {item.kind === "app" && <StatusBadge status={item.app.status} />}
          {isActive && <CornerDownLeft className="h-4 w-4 text-violet-400" aria-hidden />}
        </button>
      </li>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4">
              <Search className="h-5 w-5 text-slate-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages, applicants or IDs…"
                className="h-14 flex-1 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">Esc</kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {items.length === 0 && (
                <div className="flex flex-col items-center py-10 text-center text-sm text-slate-500">
                  <FileText className="mb-2 h-6 w-6 text-slate-300" aria-hidden />
                  No results for “{query}”
                </div>
              )}
              {pages.length > 0 && (
                <>
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pages</p>
                  <ul>{pages.map(renderItem)}</ul>
                </>
              )}
              {apps.length > 0 && (
                <>
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Applications</p>
                  <ul>{apps.map(renderItem)}</ul>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] text-slate-500">
              <span>
                <kbd className="font-sans font-semibold">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="font-sans font-semibold">↵</kbd> open
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
