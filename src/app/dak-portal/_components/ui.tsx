"use client";

import { type ReactNode, useEffect, useState } from "react";
import { animate, AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";

import type { DakStatus } from "../_data/mock";

/* -------------------------------------------------------------------------- */
/*                                   STATUS                                   */
/* -------------------------------------------------------------------------- */

export const STATUS_META: Record<DakStatus, { label: string; badge: string; dot: string; color: string }> = {
  Submitted: { label: "Submitted", badge: "bg-blue-50 text-blue-700 ring-blue-600/15", dot: "bg-blue-500", color: "#3b82f6" },
  "In Review": { label: "In Review", badge: "bg-violet-50 text-violet-700 ring-violet-600/15", dot: "bg-violet-500", color: "#8b5cf6" },
  "Information Required": { label: "Info Required", badge: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500", color: "#f59e0b" },
  "Customer Responded": { label: "Responded", badge: "bg-sky-50 text-sky-700 ring-sky-600/15", dot: "bg-sky-500", color: "#0ea5e9" },
  Approved: { label: "Approved", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500", color: "#10b981" },
  "Insurance Confirmed": { label: "Ins. Confirmed", badge: "bg-teal-50 text-teal-700 ring-teal-600/15", dot: "bg-teal-500", color: "#14b8a6" },
  Active: { label: "Active", badge: "bg-green-50 text-green-700 ring-green-600/15", dot: "bg-green-500", color: "#22c55e" },
  "Not Eligible": { label: "Not Eligible", badge: "bg-rose-50 text-rose-700 ring-rose-600/15", dot: "bg-rose-500", color: "#f43f5e" },
  Cancelled: { label: "Cancelled", badge: "bg-slate-100 text-slate-600 ring-slate-500/15", dot: "bg-slate-400", color: "#94a3b8" },
  Withdrawn: { label: "Withdrawn", badge: "bg-slate-100 text-slate-600 ring-slate-500/15", dot: "bg-slate-400", color: "#cbd5e1" },
};

export function StatusBadge({ status }: { status: DakStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   LAYOUT                                   */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.header>
  );
}

export function Panel({
  children,
  className = "",
  title,
  action,
  padded = false,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function FadeIn({ children, index = 0, className = "" }: { children: ReactNode; index?: number; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.04 + index * 0.06, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  CONTROLS                                  */
/* -------------------------------------------------------------------------- */

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
      />
    </label>
  );
}

export function Button({
  children,
  onClick,
  variant = "secondary",
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  className?: string;
}) {
  const styles = {
    primary:
      "bg-gradient-to-b from-[#8b2be2] to-[#7419c9] text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_16px_-6px_rgba(124,31,214,0.6)] hover:brightness-110",
    secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/20 ${styles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

/** Pill-shaped filter chips with optional counts. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`chip-${label}`}
                className="absolute inset-0 rounded-full bg-slate-900"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden
              />
            )}
            <span className="relative">{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`relative rounded-full px-1.5 text-[11px] font-semibold ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Segmented control, e.g. table / cards view toggle. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; icon: ReactNode; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={`relative flex h-8 w-9 items-center justify-center rounded-lg transition-colors ${
              active ? "text-violet-700" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${label}`}
                className="absolute inset-0 rounded-lg bg-violet-50 ring-1 ring-violet-200"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden
              />
            )}
            <span className="relative">{option.icon}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  DISPLAY                                   */
/* -------------------------------------------------------------------------- */

const AVATAR_TONES = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const tone = AVATAR_TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_TONES.length];
  const sizes = { sm: "h-7 w-7 text-[11px]", md: "h-9 w-9 text-xs", lg: "h-12 w-12 text-sm" };
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${tone} ${sizes[size]}`} aria-hidden>
      {initials(name)}
    </span>
  );
}

/** Number that counts up from 0 on mount. */
export function CountUp({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) return setDisplay(value);
    const controls = animate(0, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, reduceMotion]);

  return <>{display}</>;
}

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">{icon}</span>
      <p className="mt-4 font-medium text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 SLIDE-OVER                                 */
/* -------------------------------------------------------------------------- */

export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl sm:rounded-l-3xl"
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-slate-900">{title}</div>
                {subtitle && <div className="mt-0.5 text-sm text-slate-500">{subtitle}</div>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

/** Downloads rows as a CSV file (client side). */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const TH = "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500";
export const TD = "px-5 py-3.5 text-sm";
