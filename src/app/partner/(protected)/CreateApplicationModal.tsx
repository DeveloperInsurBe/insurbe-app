"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowRight, CheckCircle2, Plane, ShieldCheck, X, type LucideIcon } from "lucide-react";

type CreateApplicationModalProps = {
  open: boolean;
  onClose: () => void;
  partnerRef: string;
};

type Provider = {
  id: string;
  name: string;
  /** Short badge shown after the name, e.g. "DAK". */
  tag?: string;
  /** Where the row leads. Rows without one are "coming soon". */
  href?: (partnerRef: string) => string;
  logo?: { src: string; alt: string; width: number; height: number; className: string };
  icon?: LucideIcon;
};

type Group = {
  id: string;
  title: string;
  subtitle: string;
  providers: Provider[];
};

const GROUPS: Group[] = [
  {
    id: "public",
    title: "Public Health Insurance",
    subtitle: "Students / Employees",
    providers: [
      {
        id: "dak",
        name: "DAK-Gesundheit",
        tag: "DAK",
        href: (ref) => `/insuranceSignupFlow?provider=dak&source=partner&ref=${ref}`,
        logo: { src: "/icons/dak_logo.jpeg", alt: "DAK Logo", width: 40, height: 32, className: "h-8 w-auto" },
      },
      {
        id: "tk",
        name: "Techniker Krankenkasse",
        tag: "TK",
        href: (ref) => `/insuranceSignupFlow?provider=tk&source=partner&ref=${ref}`,
        logo: { src: "/icons/tk.png", alt: "TK Logo", width: 40, height: 40, className: "h-8 w-auto" },
      },
    ],
  },
  {
    id: "private",
    title: "Private Health Insurance",
    subtitle: "Students / Working Professionals",
    providers: [
      {
        id: "mawista",
        name: "Mawista",
        href: () => "/mawistaBooking?source=partner",
        logo: { src: "/partners_asset/mawista.svg", alt: "Mawista Logo", width: 110, height: 32, className: "h-7 w-auto" },
      },
    ],
  },
  {
    id: "travel",
    title: "Travel Students to Germany",
    subtitle: "Incoming / Travel Insurance",
    providers: [{ id: "travel", name: "Travel insurance", icon: Plane }],
  },
];

type Highlight = { top: number; height: number; visible: boolean; animate: boolean };

function ProviderRow({
  provider,
  delay,
  onHighlight,
  onSelect,
}: {
  provider: Provider;
  delay: number;
  onHighlight: (el: HTMLElement) => void;
  onSelect: () => void;
}) {
  const { name, tag, logo, icon: Icon } = provider;
  const comingSoon = !provider.href;

  return (
    <button
      type="button"
      disabled={comingSoon}
      onClick={onSelect}
      onMouseEnter={(e) => !comingSoon && onHighlight(e.currentTarget)}
      onFocus={(e) => !comingSoon && onHighlight(e.currentTarget)}
      style={{ animationDelay: `${delay}ms` }}
      className={[
        "modal-item-in group relative z-10 flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left sm:px-4 sm:py-3.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820ad1]/40",
        comingSoon ? "cursor-not-allowed" : "cursor-pointer active:scale-[0.99] transition-transform",
      ].join(" ")}
    >
      {/* LOGO */}
      <span
        className={[
          "flex h-12 min-w-12 shrink-0 items-center justify-center rounded-xl border border-[#efe3fb] bg-white px-2.5 shadow-sm transition-transform duration-300 sm:h-14 sm:min-w-14",
          comingSoon ? "opacity-50" : "group-hover:scale-105 group-hover:-rotate-2",
        ].join(" ")}
      >
        {logo ? (
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className={"object-contain " + logo.className}
          />
        ) : Icon ? (
          <Icon className="text-[#820ad1]" size={22} />
        ) : null}
      </span>

      {/* NAME */}
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          className={
            "truncate text-base font-bold sm:text-lg " +
            (comingSoon ? "text-gray-400" : "text-gray-900")
          }
        >
          {name}
        </span>
        {tag ? (
          <span className="rounded-md bg-[#f3e8ff] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#820ad1]">
            {tag}
          </span>
        ) : null}
      </span>

      {/* ACTION */}
      {comingSoon ? (
        <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500">
          Coming soon
        </span>
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e9d7ff] bg-white text-[#820ad1] transition-colors duration-300 group-hover:border-transparent group-hover:bg-[#820ad1] group-hover:text-white">
          <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      )}
    </button>
  );
}

// Product-type picker shared by the Conversions and Partner Program pages.
export default function CreateApplicationModal({
  open,
  onClose,
  partnerRef,
}: CreateApplicationModalProps) {
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  // Close on Escape and stop the page behind from scrolling while open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  // Start fresh every time the modal opens.
  useEffect(() => {
    if (open) setHighlight(null);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  // A background pill slides to whichever row is hovered / focused.
  const highlightRow = (el: HTMLElement) => {
    const list = listRef.current;
    if (!list) return;
    const listRect = list.getBoundingClientRect();
    const rowRect = el.getBoundingClientRect();
    setHighlight((prev) => ({
      top: rowRect.top - listRect.top,
      height: rowRect.height,
      visible: true,
      animate: prev !== null,
    }));
  };

  let rowIndex = 0;

  // Rendered into <body> so no parent card's stacking context (e.g. a
  // `relative z-10` wrapper) can leave the modal underneath page content.
  return createPortal(
    <div
      className="modal-overlay-in fixed inset-0 z-[100] flex items-end justify-center bg-[#0f0620]/70 backdrop-blur-md sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-application-title"
        // mobile: bottom sheet (whole sheet scrolls) — md+: split dialog (right side scrolls)
        className="modal-panel-in relative flex max-h-[calc(100dvh-0.75rem)] w-full flex-col overflow-y-auto rounded-t-[28px] bg-white shadow-2xl md:max-h-[calc(100dvh-3rem)] md:max-w-4xl md:flex-row md:overflow-hidden md:rounded-[32px] lg:max-w-6xl"
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition-all hover:rotate-90 hover:bg-white/25 md:right-5 md:top-5 md:h-11 md:w-11 md:bg-gray-100 md:text-gray-600 md:ring-0 md:hover:bg-gray-200"
        >
          <X size={20} />
        </button>

        {/* BRAND PANEL */}
        <aside className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#3b0764] via-[#820ad1] to-[#a855f7] px-6 pb-8 pt-4 text-white md:w-[40%] md:px-10 md:py-12">
          {/* animated background shapes */}
          <div className="modal-float pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div
            className="modal-float pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#f0abfc]/25 blur-3xl"
            style={{ animationDelay: "-4s" }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative flex h-full flex-col">
            {/* drag-handle look on mobile */}
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-white/30 md:hidden" />

            <div className="modal-item-in relative mb-5 h-14 w-14 md:mb-8 md:h-16 md:w-16" style={{ animationDelay: "120ms" }}>
              <span className="modal-ring absolute inset-0 rounded-2xl bg-white/30" />
              <span className="relative flex h-full w-full items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur">
                <ShieldCheck size={28} />
              </span>
            </div>

            <div className="modal-item-in" style={{ animationDelay: "180ms" }}>
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[2px] text-white/90">
                New Application
              </span>
            </div>

            <h2
              id="create-application-title"
              className="modal-item-in mt-4 text-3xl font-black leading-[1.1] sm:text-4xl lg:text-5xl"
              style={{ animationDelay: "240ms" }}
            >
              Please Select a Product Type
            </h2>

            <p
              className="modal-item-in mt-3 max-w-sm text-sm leading-relaxed text-white/80 md:text-base"
              style={{ animationDelay: "300ms" }}
            >
              Choose an insurance category to continue application process.
            </p>

            <p
              className="modal-item-in mt-auto hidden items-start gap-2 pt-10 text-sm text-white/70 md:flex"
              style={{ animationDelay: "380ms" }}
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-white/90" />
              Applications you start here are linked to your partner account.
            </p>
          </div>
        </aside>

        {/* PRODUCT LIST */}
        <div className="min-h-0 flex-1 px-3 pb-6 pt-5 sm:px-6 md:overflow-y-auto md:overscroll-contain md:px-8 md:pb-10 md:pt-16 lg:px-10">
          <div
            ref={listRef}
            className="relative space-y-6"
            onMouseLeave={() => setHighlight((h) => (h ? { ...h, visible: false } : h))}
            onBlur={() => setHighlight((h) => (h ? { ...h, visible: false } : h))}
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

            {GROUPS.map((group) => (
              <section key={group.id}>
                <div
                  className="modal-item-in mb-1.5 px-3 sm:px-4"
                  style={{ animationDelay: `${180 + rowIndex * 70}ms` }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">
                    {group.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{group.subtitle}</p>
                </div>

                <div className="space-y-1">
                  {group.providers.map((provider) => {
                    const delay = 240 + rowIndex++ * 70;
                    return (
                      <ProviderRow
                        key={provider.id}
                        provider={provider}
                        delay={delay}
                        onHighlight={highlightRow}
                        onSelect={() => {
                          if (provider.href) router.push(provider.href(partnerRef));
                        }}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
