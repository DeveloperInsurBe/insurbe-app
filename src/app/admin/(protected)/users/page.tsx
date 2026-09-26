import {
  ChevronRight,
  Info,
  Mail,
  MapPin,
  Phone,
  Search,
  UserCheck,
} from "lucide-react";

import { FilterGroup, PeriodSwitch, SplitBar, initials, pick, statusTone } from "../adminUi";
import Pagination, {
  PAGE_SIZES,
  parsePage,
  parsePageSize,
} from "../Pagination";
import { PERIODS, parsePeriod, periodHref } from "../partners/publicInsurance";
import {
  getCustomers,
  type Customer,
  type CustomerKind,
  type CustomerSource,
} from "./customers";
import CountUp from "../CountUp";

const PRODUCTS = [
  { value: "all", label: "All products" },
  { value: "tk", label: "TK" },
  { value: "dak", label: "DAK" },
  { value: "private", label: "Private" },
] as const;

const SOURCES = [
  { value: "all", label: "Any source" },
  { value: "direct", label: "Direct" },
  { value: "partner", label: "Via partner" },
  { value: "agent", label: "Via agent" },
] as const;

const SORTS = [
  { value: "latest", label: "Latest activity" },
  { value: "apps", label: "Most applications" },
  { value: "name", label: "Name A–Z" },
] as const;

const KIND_STYLE: Record<CustomerKind, string> = {
  TK: "bg-blue-50 text-blue-700 border-blue-200",
  DAK: "bg-emerald-50 text-emerald-700 border-emerald-200",
  private: "bg-[#820ad1]/5 text-[#820ad1] border-[#820ad1]/20",
};

const SOURCE_LABEL: Record<CustomerSource, string> = {
  direct: "Direct",
  partner: "Partner",
  agent: "Agent",
};

const formatDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

function ProductBadges({ customer }: { customer: Customer }) {
  const kinds = (["TK", "DAK", "private"] as const).filter(
    (kind) => customer.counts[kind] > 0,
  );

  return (
    <div className="flex flex-wrap gap-1">
      {kinds.map((kind) => (
        <span
          key={kind}
          className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${KIND_STYLE[kind]}`}
        >
          {kind === "private" ? "Private" : kind}
          {customer.counts[kind] > 1 ? ` ×${customer.counts[kind]}` : ""}
        </span>
      ))}
    </div>
  );
}

function SourceLabel({ customer }: { customer: Customer }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-700">
        {SOURCE_LABEL[customer.source]}
      </p>
      {customer.referrer ? (
        <p className="truncate text-[11px] text-gray-500">{customer.referrer}</p>
      ) : null}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-500">{label}</p>
        <p className="break-words text-sm text-gray-900">{value || "-"}</p>
      </div>
    </div>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    q?: string;
    product?: string;
    source?: string;
    sort?: string;
    page?: string;
    size?: string;
  }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const q = (params.q || "").trim().toLowerCase();
  const product = pick(PRODUCTS, params.product);
  const source = pick(SOURCES, params.source);
  const sort = pick(SORTS, params.sort);

  const allCustomers = (await getCustomers(period)).filter((customer) =>
    q
      ? [customer.name, customer.email, customer.phone, customer.city]
          .join(" ")
          .toLowerCase()
          .includes(q)
      : true,
  );

  /**
   * SUMMARY (PERIOD + SEARCH, BEFORE CHIP FILTERS)
   */
  const summary = allCustomers.reduce(
    (acc, customer) => {
      acc.accounts += customer.hasAccount ? 1 : 0;
      acc.tk += customer.counts.TK > 0 ? 1 : 0;
      acc.dak += customer.counts.DAK > 0 ? 1 : 0;
      acc.private += customer.counts.private > 0 ? 1 : 0;
      acc[customer.source] += 1;
      return acc;
    },
    { accounts: 0, tk: 0, dak: 0, private: 0, direct: 0, partner: 0, agent: 0 },
  );

  const customers = allCustomers
    .filter((customer) => {
      if (product === "tk" && customer.counts.TK === 0) return false;
      if (product === "dak" && customer.counts.DAK === 0) return false;
      if (product === "private" && customer.counts.private === 0) return false;
      if (source !== "all" && customer.source !== source) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return (a.name || a.email).localeCompare(b.name || b.email);
      if (sort === "apps") {
        return b.applications.length - a.applications.length;
      }
      return (b.latestAt?.getTime() ?? 0) - (a.latestAt?.getTime() ?? 0);
    });

  const pageSize = parsePageSize(params.size);
  const page = parsePage(params.page, Math.ceil(customers.length / pageSize));
  const offset = (page - 1) * pageSize;
  const pagedCustomers = customers.slice(offset, offset + pageSize);

  const listHref = (overrides: {
    period?: string;
    product?: string;
    source?: string;
    sort?: string;
    page?: number;
    size?: number;
  }) => {
    const nextSize = overrides.size ?? pageSize;
    const nextPage = overrides.page ?? 1;
    const nextSort = overrides.sort ?? sort;

    return periodHref("/admin/users", {
      period: overrides.period ?? period,
      q: params.q?.trim(),
      product: overrides.product ?? product,
      source: overrides.source ?? source,
      sort: nextSort === "latest" ? undefined : nextSort,
      size: nextSize === PAGE_SIZES[0] ? undefined : String(nextSize),
      page: nextPage === 1 ? undefined : String(nextPage),
    });
  };

  const sourceTotal = summary.direct + summary.partner + summary.agent;
  const percent = (value: number) =>
    sourceTotal ? Math.round((value / sourceTotal) * 100) : 0;

  const gridCols =
    "lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_1.5rem] lg:items-center lg:gap-4";

  return (
    <div className="min-w-0 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 sm:text-2xl">
            Customers
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            Everyone who applied: contact details, products and how they came
          </p>
        </div>

        <PeriodSwitch
          periods={PERIODS}
          active={period}
          hrefFor={(value) => listHref({ period: value })}
        />
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Customers
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            <CountUp value={allCustomers.length} />
          </p>
          <p className="mt-1 text-xs text-gray-500">
            <span className="font-semibold text-[#820ad1]"><CountUp value={summary.accounts} delay={250} /></span>{" "}
            with login account
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Public insurance
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            <CountUp value={summary.tk + summary.dak} />
          </p>
          <div className="mt-2">
            <SplitBar tk={summary.tk} dak={summary.dak} />
            <div className="mt-1.5 flex justify-between text-[11px] font-semibold">
              <span className="text-blue-600">TK {summary.tk}</span>
              <span className="text-emerald-600">DAK {summary.dak}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Private insurance
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            <CountUp value={summary.private} />
          </p>
          <p className="mt-1 text-xs text-gray-500">customers</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            How they came
          </p>
          <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="bg-gray-700" style={{ width: `${percent(summary.direct)}%` }} />
            <div className="bg-[#820ad1]" style={{ width: `${percent(summary.partner)}%` }} />
            <div className="bg-amber-500" style={{ width: `${percent(summary.agent)}%` }} />
          </div>
          <div className="mt-2 space-y-0.5 text-[11px] font-semibold">
            <p className="flex justify-between text-gray-700">
              <span>Direct</span>
              <CountUp value={summary.direct} delay={250} />
            </p>
            <p className="flex justify-between text-[#820ad1]">
              <span>Partner</span>
              <CountUp value={summary.partner} delay={250} />
            </p>
            <p className="flex justify-between text-amber-600">
              <span>Agent</span>
              <CountUp value={summary.agent} delay={250} />
            </p>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <form action="/admin/users" className="relative">
          {period !== "all" ? <input type="hidden" name="period" value={period} /> : null}
          {product !== "all" ? <input type="hidden" name="product" value={product} /> : null}
          {source !== "all" ? <input type="hidden" name="source" value={source} /> : null}
          {sort !== "latest" ? <input type="hidden" name="sort" value={sort} /> : null}
          {pageSize !== PAGE_SIZES[0] ? (
            <input type="hidden" name="size" value={pageSize} />
          ) : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by name, email, phone or city…"
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition-all focus:border-[#820ad1] focus:bg-white focus:ring-4 focus:ring-[#820ad1]/10"
          />
        </form>

        <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center xl:gap-x-6">
          <FilterGroup
            label="Product"
            options={[
              { ...PRODUCTS[0], count: allCustomers.length },
              { ...PRODUCTS[1], count: summary.tk, dot: "bg-blue-500" },
              { ...PRODUCTS[2], count: summary.dak, dot: "bg-emerald-500" },
              { ...PRODUCTS[3], count: summary.private, dot: "bg-[#820ad1]" },
            ]}
            active={product}
            hrefFor={(value) => listHref({ product: value })}
          />

          <FilterGroup
            label="Source"
            options={[
              { ...SOURCES[0], count: allCustomers.length },
              { ...SOURCES[1], count: summary.direct, dot: "bg-gray-700" },
              { ...SOURCES[2], count: summary.partner, dot: "bg-[#820ad1]" },
              { ...SOURCES[3], count: summary.agent, dot: "bg-amber-500" },
            ]}
            active={source}
            hrefFor={(value) => listHref({ source: value })}
          />

          <div className="xl:ml-auto">
            <FilterGroup
              label="Sort"
              options={SORTS}
              active={sort}
              hrefFor={(value) => listHref({ sort: value })}
            />
          </div>
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-gray-500 sm:text-xs">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        One row per customer email, combining TK, DAK and private applications.
        Click a customer to see contact details and every application.
      </p>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No customers found</p>
          <p className="mt-1 text-xs text-gray-500">
            Try another search, period or filter.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* DESKTOP HEADER */}
            <div
              className={`hidden border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 ${gridCols}`}
            >
              <span>Customer</span>
              <span>Contact</span>
              <span>Products</span>
              <span>Came via</span>
              <span>Last activity</span>
              <span />
            </div>

            {pagedCustomers.map((customer) => (
              <details
                key={customer.email}
                className="group border-t border-gray-100 first:border-t-0 lg:first:border-t-0"
              >
                <summary
                  className={`flex cursor-pointer list-none flex-col gap-3 px-4 py-3 transition-colors hover:bg-[#820ad1]/[0.03] group-open:bg-[#820ad1]/[0.04] [&::-webkit-details-marker]:hidden ${gridCols}`}
                >
                  {/* CUSTOMER */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#820ad1]/10 text-xs font-black text-[#820ad1]">
                      {initials(customer.name || customer.email)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-900">
                        <span className="truncate">{customer.name || "Unnamed"}</span>
                        {customer.hasAccount ? (
                          <UserCheck
                            className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                            aria-label="Has login account"
                          />
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-gray-500 lg:hidden">
                        {customer.email}
                      </p>
                      <p className="hidden truncate text-xs text-gray-500 lg:block">
                        {[customer.city, customer.country].filter(Boolean).join(", ") ||
                          "No location"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-open:rotate-90 lg:hidden" />
                  </div>

                  {/* CONTACT (DESKTOP) */}
                  <div className="hidden min-w-0 lg:block">
                    <p className="truncate text-sm text-gray-700">{customer.email}</p>
                    <p className="truncate text-xs text-gray-500">
                      {customer.phone || "No phone"}
                    </p>
                  </div>

                  {/* MOBILE META */}
                  <div className="flex items-center justify-between gap-3 lg:contents">
                    <ProductBadges customer={customer} />
                    <div className="text-right lg:text-left">
                      <SourceLabel customer={customer} />
                    </div>
                    <p className="hidden text-xs text-gray-600 lg:block">
                      {formatDate(customer.latestAt)}
                    </p>
                  </div>

                  <ChevronRight className="hidden h-4 w-4 text-gray-300 transition-transform group-open:rotate-90 lg:block" />
                </summary>

                {/* EXPANDED DETAILS */}
                <div className="grid gap-4 border-t border-gray-100 bg-gray-50/60 px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                  <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Contact details
                    </p>
                    <DetailRow icon={Mail} label="Email" value={customer.email} />
                    <DetailRow icon={Phone} label="Phone" value={customer.phone} />
                    <DetailRow
                      icon={MapPin}
                      label="Location"
                      value={[customer.city, customer.country].filter(Boolean).join(", ")}
                    />
                    <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                      <div>
                        <p className="text-[11px] text-gray-500">Nationality</p>
                        <p className="text-gray-900">{customer.nationality || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500">Date of birth</p>
                        <p className="text-gray-900">{customer.dob || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500">Login account</p>
                        <p className={customer.hasAccount ? "text-emerald-700" : "text-gray-500"}>
                          {customer.hasAccount ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500">Came via</p>
                        <SourceLabel customer={customer} />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Applications ({customer.applications.length})
                    </p>
                    <ul className="mt-2 divide-y divide-gray-100">
                      {customer.applications.map((app) => (
                        <li
                          key={`${app.kind}-${app.id}`}
                          className="flex flex-col gap-1.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${KIND_STYLE[app.kind]}`}
                            >
                              {app.kind === "private" ? "Private" : app.kind}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {app.product}
                              </p>
                              <p className="truncate font-mono text-[11px] text-gray-500">
                                {app.ref}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 text-xs text-gray-500">
                            <span>{formatDate(app.createdAt)}</span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusTone(app.status)}`}
                            >
                              {app.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={customers.length}
            hrefFor={({ page: nextPage, size }) =>
              listHref({ page: nextPage, size })
            }
          />
        </>
      )}
    </div>
  );
}
