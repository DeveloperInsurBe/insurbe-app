import Link from "next/link";

export const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function pick<T extends string>(
  options: readonly { value: T }[],
  value: string | undefined,
): T {
  return options.find((option) => option.value === value)?.value ?? options[0].value;
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function statusTone(status: string) {
  const value = status.toLowerCase();

  if (value.includes("fail") || value.includes("reject")) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (
    value.includes("complete") ||
    value.includes("approve") ||
    value.includes("active") ||
    value === "submitted"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

export function RateBadge({ rate, custom }: { rate: number; custom: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className="text-sm font-bold text-gray-900">€{rate}</span>
      <span
        className={`rounded px-1.5 py-px text-[10px] font-bold uppercase tracking-wide ${
          custom ? "bg-[#820ad1]/10 text-[#820ad1]" : "bg-gray-100 text-gray-500"
        }`}
      >
        {custom ? "Custom" : "Default"}
      </span>
    </span>
  );
}

export function SplitBar({ tk, dak }: { tk: number; dak: number }) {
  const total = tk + dak;

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      {total > 0 ? (
        <>
          <div className="bg-blue-500" style={{ width: `${(tk / total) * 100}%` }} />
          <div className="bg-emerald-500" style={{ width: `${(dak / total) * 100}%` }} />
        </>
      ) : null}
    </div>
  );
}

export type FilterOption = {
  value: string;
  label: string;
  count?: number;
  dot?: string;
};

/**
 * Segmented filter: soft grey track, active option lifts out as a
 * white tab with brand-coloured text.
 */
export function FilterGroup({
  label,
  options,
  active,
  hrefFor,
}: {
  label: string;
  options: readonly FilterOption[];
  active: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <div className="flex min-w-0 overflow-x-auto rounded-xl bg-gray-100 p-1 [scrollbar-width:none]">
        {options.map((option) => {
          const isActive = option.value === active;

          return (
            <Link
              key={option.value}
              href={hrefFor(option.value)}
              aria-current={isActive ? "true" : undefined}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white text-[#820ad1] shadow-sm ring-1 ring-[#820ad1]/15"
                  : "text-gray-500 hover:bg-white/60 hover:text-gray-900"
              }`}
            >
              {option.dot ? (
                <span className={`h-1.5 w-1.5 rounded-full ${option.dot}`} />
              ) : null}
              {option.label}
              {option.count !== undefined ? (
                <span
                  className={`rounded-md px-1.5 py-px text-[10px] font-bold ${
                    isActive
                      ? "bg-[#820ad1]/10 text-[#820ad1]"
                      : "bg-gray-200/70 text-gray-500"
                  }`}
                >
                  {option.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PeriodSwitch({
  periods,
  active,
  hrefFor,
}: {
  periods: readonly { value: string; label: string }[];
  active: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="flex w-full rounded-xl border border-gray-200 bg-white p-1 sm:w-auto">
      {periods.map((item) => (
        <Link
          key={item.value}
          href={hrefFor(item.value)}
          className={`flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-center text-xs font-semibold transition-all sm:flex-none sm:text-sm ${
            active === item.value
              ? "bg-[#820ad1] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
