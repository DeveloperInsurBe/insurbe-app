"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileSearch, FileText, LayoutGrid, Rows3 } from "lucide-react";
import { toast } from "sonner";

import { api, applicationHref, fileKind, fmtDate, fmtSize, type DakDocumentDto } from "../../_lib/client";
import { DocumentLinks, ReviewPill } from "../../_components/application/Tabs";
import {
  Button,
  EmptyState,
  ErrorState,
  FilterChips,
  LoadingState,
  PageHeader,
  Panel,
  SearchInput,
  Segmented,
  TD,
  TH,
} from "../../_components/ui";

type PortalDocument = DakDocumentDto & { applicationId: string; applicant: string };
type ReviewFilter = "all" | DakDocumentDto["reviewStatus"];
type View = "list" | "grid";

const SOURCE_LABEL: Record<DakDocumentDto["source"], string> = {
  customer: "Customer",
  insurbe: "InsurBe Generated",
  dak: "DAK Upload",
};

function SourcePill({ source }: { source: DakDocumentDto["source"] }) {
  const tone = source === "customer" ? "bg-sky-50 text-sky-700" : source === "dak" ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>{SOURCE_LABEL[source]}</span>;
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
  const [documents, setDocuments] = useState<PortalDocument[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [review, setReview] = useState<ReviewFilter>("all");
  const [view, setView] = useState<View>("list");
  const [reviewing, setReviewing] = useState<string | null>(null);

  const load = useCallback(() => {
    setError("");
    api<{ documents: PortalDocument[] }>("/documents")
      .then((data) => setDocuments(data.documents))
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  useEffect(load, [load]);

  const all = useMemo(() => documents ?? [], [documents]);
  const count = (value: DakDocumentDto["reviewStatus"]) => all.filter((document) => document.reviewStatus === value).length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (document) =>
        (review === "all" || document.reviewStatus === review) &&
        (!q ||
          [document.name, document.applicant, document.applicationId, SOURCE_LABEL[document.source]].some((value) =>
            value.toLowerCase().includes(q),
          )),
    );
  }, [all, query, review]);

  const markReviewed = async (document: PortalDocument) => {
    setReviewing(document.id);
    try {
      const data = await api<{ document: DakDocumentDto }>(`/documents/${document.id}`, { method: "PATCH" });
      setDocuments((items) => items?.map((item) => (item.id === document.id ? { ...item, ...data.document } : item)) ?? items);
    } catch (reviewError) {
      toast.error((reviewError as Error).message);
    } finally {
      setReviewing(null);
    }
  };

  const reviewAction = (document: PortalDocument) =>
    document.reviewStatus === "pending" && (
      <Button onClick={() => markReviewed(document)} loading={reviewing === document.id} className="h-8 px-3 text-xs">
        Mark reviewed
      </Button>
    );

  const empty = <EmptyState icon={<FileSearch className="h-6 w-6" />} title="No documents found" text="Try another search or filter." />;

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle={
          documents ? (
            <>
              {documents.length} documents across all applications ·{" "}
              <span className="font-medium text-amber-600">{count("pending")} unreviewed</span>
            </>
          ) : (
            "All application documents"
          )
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
            { value: "all", label: "All", count: all.length },
            { value: "pending", label: "Pending", count: count("pending") },
            { value: "reviewed", label: "Reviewed", count: count("reviewed") },
            { value: "auto", label: "Auto", count: count("auto") },
          ]}
        />
      </div>

      {error && !documents ? (
        <Panel>
          <ErrorState message={error} onRetry={load} />
        </Panel>
      ) : !documents ? (
        <LoadingState label="Loading documents…" />
      ) : (
        <>
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
                        <th className={TH}>Review</th>
                        <th className={`${TH} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                        {rows.map((document, index) => (
                          <motion.tr
                            key={document.id}
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
                                  <p className="text-xs text-slate-500">
                                    {fileKind(document.mimeType)} · {fmtSize(document.size)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className={TD}>
                              <Link href={applicationHref(document.applicationId)} className="hover:underline">
                                <p className="font-medium text-slate-800">{document.applicant}</p>
                                <p className="font-mono text-xs text-slate-500">{document.applicationId}</p>
                              </Link>
                            </td>
                            <td className={TD}>
                              <SourcePill source={document.source} />
                            </td>
                            <td className={`${TD} text-slate-600`}>{fmtDate(document.uploadedAt)}</td>
                            <td className={TD}>
                              <ReviewPill review={document.reviewStatus} />
                            </td>
                            <td className={TD}>
                              <div className="flex items-center justify-end gap-2">
                                {reviewAction(document)}
                                <DocumentLinks document={document} />
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
                      key={document.id}
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
                            {fileKind(document.mimeType)} · {fmtSize(document.size)} · {fmtDate(document.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <ReviewPill review={document.reviewStatus} />
                        <SourcePill source={document.source} />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <Link href={applicationHref(document.applicationId)} className="min-w-0 hover:underline">
                          <p className="truncate text-sm font-medium text-slate-800">{document.applicant}</p>
                          <p className="font-mono text-[11px] text-slate-500">{document.applicationId}</p>
                        </Link>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {reviewAction(document)}
                          <DocumentLinks document={document} />
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </>
      )}
    </>
  );
}
