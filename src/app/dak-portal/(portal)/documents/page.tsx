"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, CircleCheck, Download, Eye, FileSearch, FileText, LayoutGrid, Rows3, ShieldCheck } from "lucide-react";

import { DAK_DOCUMENTS, type DakDocument } from "../../_data/mock";
import { EmptyState, FilterChips, PageHeader, Panel, SearchInput, Segmented, TD, TH } from "../../_components/ui";

type ReviewFilter = "all" | DakDocument["review"];
type View = "list" | "grid";

function ReviewPill({ review }: { review: DakDocument["review"] }) {
  const styles = {
    Reviewed: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    Auto: "bg-slate-100 text-slate-600 ring-slate-500/15",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[review]}`}>
      {review === "Reviewed" && <CircleCheck className="h-3.5 w-3.5" aria-hidden />}
      {review === "Auto" && <Bot className="h-3.5 w-3.5" aria-hidden />}
      {review === "Pending" && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />}
      {review}
    </span>
  );
}

function SourcePill({ source }: { source: DakDocument["source"] }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        source === "Customer" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"
      }`}
    >
      {source}
    </span>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => event.stopPropagation()}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
    >
      {children}
    </button>
  );
}

const FileIcon = ({ large }: { large?: boolean }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 ring-1 ring-rose-100 ${
      large ? "h-12 w-12" : "h-10 w-10"
    }`}
  >
    <FileText className={large ? "h-6 w-6" : "h-5 w-5"} aria-hidden />
  </span>
);

export default function DakDocumentsPage() {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [review, setReview] = useState<ReviewFilter>("all");
  const [view, setView] = useState<View>("list");

  const count = (value: DakDocument["review"]) => DAK_DOCUMENTS.filter((document) => document.review === value).length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DAK_DOCUMENTS.filter(
      (document) =>
        (review === "all" || document.review === review) &&
        (!q ||
          [document.name, document.applicant, document.applicationId, document.source].some((value) =>
            value.toLowerCase().includes(q),
          )),
    );
  }, [query, review]);

  const empty = <EmptyState icon={<FileSearch className="h-6 w-6" />} title="No documents found" text="Try another search or filter." />;
  const key = (document: DakDocument) => `${document.applicationId}-${document.name}-${document.size}`;

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle={
          <>
            {DAK_DOCUMENTS.length} documents across all applications ·{" "}
            <span className="font-medium text-amber-600">{count("Pending")} unreviewed</span>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search documents…" className="md:max-w-sm md:flex-1" />
        <div className="hidden md:ml-auto md:block">
          <Segmented
            label="Documents view"
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: "List view", icon: <Rows3 className="h-4 w-4" /> },
              { value: "grid", label: "Grid view", icon: <LayoutGrid className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>

      <div className="mb-5">
        <FilterChips
          label="review"
          value={review}
          onChange={setReview}
          options={[
            { value: "all", label: "All", count: DAK_DOCUMENTS.length },
            { value: "Pending", label: "Pending", count: count("Pending") },
            { value: "Reviewed", label: "Reviewed", count: count("Reviewed") },
            { value: "Auto", label: "Auto", count: count("Auto") },
          ]}
        />
      </div>

      {/* LIST (desktop) */}
      {view === "list" && (
        <Panel className="hidden md:block">
          {rows.length === 0 ? (
            empty
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="border-b border-slate-100 bg-slate-50/60">
                  <tr>
                    <th className={TH}>Document</th>
                    <th className={TH}>Application</th>
                    <th className={TH}>Source</th>
                    <th className={TH}>Uploaded</th>
                    <th className={TH}>Scan</th>
                    <th className={TH}>Review</th>
                    <th className={`${TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {rows.map((document, index) => (
                      <motion.tr
                        key={key(document)}
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.3) }}
                        className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-violet-50/40"
                      >
                        <td className={TD}>
                          <div className="flex items-center gap-3">
                            <FileIcon />
                            <div className="min-w-0">
                              <p className="max-w-[280px] truncate font-medium text-slate-900" title={document.name}>
                                {document.name}
                              </p>
                              <p className="text-xs text-slate-500">PDF · {document.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className={TD}>
                          <p className="font-medium text-slate-800">{document.applicant}</p>
                          <p className="font-mono text-xs text-slate-500">{document.applicationId}</p>
                        </td>
                        <td className={TD}>
                          <SourcePill source={document.source} />
                        </td>
                        <td className={`${TD} text-slate-600`}>{document.uploaded}</td>
                        <td className={TD}>
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                            <ShieldCheck className="h-4 w-4" aria-hidden /> {document.scan}
                          </span>
                        </td>
                        <td className={TD}>
                          <ReviewPill review={document.review} />
                        </td>
                        <td className={TD}>
                          <div className="flex justify-end gap-1">
                            <IconButton label={`View ${document.name}`}>
                              <Eye className="h-4 w-4" aria-hidden />
                            </IconButton>
                            <IconButton label={`Download ${document.name}`}>
                              <Download className="h-4 w-4" aria-hidden />
                            </IconButton>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {/* GRID (mobile always, desktop when selected) */}
      <div className={view === "list" ? "md:hidden" : ""}>
        {rows.length === 0 ? (
          <Panel>{empty}</Panel>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {rows.map((document, index) => (
                <motion.li
                  key={key(document)}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.3) }}
                  className="group rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
                >
                  <div className="flex items-start gap-3">
                    <FileIcon large />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900" title={document.name}>
                        {document.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        PDF · {document.size} · {document.uploaded}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <ReviewPill review={document.review} />
                    <SourcePill source={document.source} />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{document.applicant}</p>
                      <p className="font-mono text-[11px] text-slate-500">{document.applicationId}</p>
                    </div>
                    <div className="flex gap-1">
                      <IconButton label={`View ${document.name}`}>
                        <Eye className="h-4 w-4" aria-hidden />
                      </IconButton>
                      <IconButton label={`Download ${document.name}`}>
                        <Download className="h-4 w-4" aria-hidden />
                      </IconButton>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </>
  );
}
