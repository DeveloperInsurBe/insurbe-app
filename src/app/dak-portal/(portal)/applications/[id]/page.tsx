"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, CalendarDays, FolderOpen, LayoutGrid, Lock, MessageSquare, UserRound } from "lucide-react";

import { canDak, isDakFinal, type DakAction } from "@/lib/dak/statuses";
import { api, BASE, fmtLongDate, type DakCaseDetail } from "../../../_lib/client";
import ActionDrawer, { type DrawerKind } from "../../../_components/application/ActionDrawer";
import { ApplicantTab, DocumentsTab, OverviewTab, RequestsTab } from "../../../_components/application/Tabs";
import { Button, ErrorState, initials, LoadingState, Panel, StatusBadge } from "../../../_components/ui";

type Tab = "overview" | "applicant" | "documents" | "requests";

type HeaderAction = { kind: DrawerKind; label: string; variant: "primary" | "secondary" | "danger" | "warning" };

/** Buttons in the header, per status (see the DAK workflow in lib/dak/statuses). */
function headerActions(application: DakCaseDetail): HeaderAction[] {
  const status = application.status;
  const can = (action: DakAction) => canDak(action, status);
  const actions: HeaderAction[] = [];
  if (can("request_info") && status !== "Information Required") {
    actions.push({ kind: "request_info", label: "Request Information", variant: "secondary" });
  }
  if (can("not_eligible")) actions.push({ kind: "not_eligible", label: "Not Eligible", variant: "warning" });
  if (can("cancel")) actions.push({ kind: "cancel", label: "Cancel Application", variant: "danger" });
  if (can("start_review")) actions.push({ kind: "start_review", label: "Start Review", variant: "primary" });
  if (can("approve")) {
    actions.push({
      kind: "approve",
      label: status === "Customer Responded" ? "Continue Review" : "Approve Application",
      variant: "primary",
    });
  }
  if (can("allocate")) actions.push({ kind: "allocate", label: "Confirm Allocation", variant: "primary" });
  return actions;
}

function DuePill({ due }: { due: DakCaseDetail["due"] }) {
  if (!due) return null;
  return due === "overdue" ? (
    <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">Overdue</span>
  ) : (
    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Due Soon</span>
  );
}

export default function DakApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [application, setApplication] = useState<DakCaseDetail | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [drawer, setDrawer] = useState<DrawerKind | null>(null);

  const load = useCallback(() => {
    setError("");
    api<{ application: DakCaseDetail }>(`/applications/${encodeURIComponent(id)}`)
      .then((data) => setApplication(data.application))
      .catch((loadError: Error) => setError(loadError.message));
  }, [id]);

  useEffect(load, [load]);

  if (error && !application) {
    return (
      <Panel>
        <ErrorState message={error} onRetry={load} />
      </Panel>
    );
  }
  if (!application) {
    return (
      <LoadingState label="Loading application…" fill />
    );
  }

  const { applicant, status } = application;
  const locked = isDakFinal(status);
  const openRequests = application.requests.filter((request) => request.status === "open").length;
  const actions = headerActions(application);
  const startDate = application.allocation?.startDate ?? applicant.requestedStartDate;

  const TABS: { id: Tab; label: string; icon: typeof LayoutGrid; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "applicant", label: "Applicant Info", icon: UserRound },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "requests", label: "Requests", icon: MessageSquare, badge: openRequests || undefined },
  ];

  return (
    <>
      <Link href={`${BASE}/applications`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Applications
      </Link>

      {/* HEADER */}
      <header className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a24ff5] to-[#7419c9] text-xl font-bold text-white shadow-lg shadow-violet-500/25">
            {initials(applicant.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{applicant.name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span className="font-mono">{application.id}</span>
              {applicant.category && <span>· {applicant.category}</span>}
              {startDate && (
                <span className="inline-flex items-center gap-1">
                  · <CalendarDays className="h-4 w-4" aria-hidden /> Start {fmtLongDate(startDate)}
                </span>
              )}
              {!locked && <DuePill due={application.due} />}
            </p>
          </div>
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-2 xl:justify-end">
            {actions.map((action) => (
              <Button key={action.kind} variant={action.variant} onClick={() => setDrawer(action.kind)} className="h-11 px-5">
                {action.label}
              </Button>
            ))}
          </div>
        ) : (
          locked && (
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Lock className="h-3.5 w-3.5" aria-hidden /> Final — no further changes possible
            </span>
          )
        )}
      </header>

      {/* BANNERS */}
      {status === "Information Required" && openRequests > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3.5 text-sm font-medium text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1">
            {openRequests} open information {openRequests === 1 ? "request" : "requests"} — waiting for customer response.
          </span>
          <button type="button" onClick={() => setTab("requests")} className="text-sm font-semibold underline">
            View requests
          </button>
        </div>
      )}
      {status === "Customer Responded" && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3.5 text-sm font-medium text-sky-800">
          <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1">Customer has responded — review their response and continue.</span>
          <button type="button" onClick={() => setTab("requests")} className="text-sm font-semibold underline">
            View response
          </button>
        </div>
      )}

      {/* TABS */}
      <div role="tablist" aria-label="Application sections" className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(({ id: tabId, label, icon: Icon, badge }) => {
          const active = tab === tabId;
          return (
            <button
              key={tabId}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(tabId)}
              className={`relative flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                active ? "text-violet-700" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
              {badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1 text-[11px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
              {active && <motion.span layoutId="dak-application-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-violet-600" aria-hidden />}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="pt-6">
        {tab === "overview" && <OverviewTab application={application} />}
        {tab === "applicant" && <ApplicantTab application={application} />}
        {tab === "documents" && <DocumentsTab application={application} locked={locked} onChanged={load} />}
        {tab === "requests" && (
          <RequestsTab
            application={application}
            canRequest={canDak("request_info", status)}
            onNewRequest={() => setDrawer("request_info")}
            onChanged={load}
          />
        )}
      </div>

      <ActionDrawer
        kind={drawer}
        application={application}
        onClose={() => setDrawer(null)}
        onDone={() => {
          setDrawer(null);
          load();
        }}
      />
    </>
  );
}
