"use client";

import { AlertCircle, CalendarDays, Clock3, FileText, Tag } from "lucide-react";

import { DAK_ACTIVITY_LOG, DAK_DOCUMENTS, type DakApplication } from "../_data/mock";
import { Avatar, SlideOver, StatusBadge } from "./ui";

export default function ApplicationDrawer({
  application,
  onClose,
}: {
  application: DakApplication | null;
  onClose: () => void;
}) {
  const documents = application ? DAK_DOCUMENTS.filter((document) => document.applicationId === application.id) : [];
  const history = application ? DAK_ACTIVITY_LOG.filter((entry) => entry.applicationId === application.id) : [];

  return (
    <SlideOver
      open={!!application}
      onClose={onClose}
      title={
        application && (
          <span className="flex items-center gap-3">
            <Avatar name={application.name} size="lg" />
            <span>
              <span className="block">{application.name}</span>
              <span className="block text-sm font-normal text-slate-500">{application.id}</span>
            </span>
          </span>
        )
      }
    >
      {application && (
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={application.status} />
            {application.openRequests > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                {application.openRequests} open {application.openRequests === 1 ? "request" : "requests"}
              </span>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {[
              { icon: Tag, label: "Category", value: application.category ?? "—" },
              { icon: CalendarDays, label: "Date of birth", value: application.birthDate },
              { icon: FileText, label: "Submitted", value: application.submitted },
              { icon: CalendarDays, label: "Start date", value: application.startDate },
              { icon: Clock3, label: "Age in queue", value: application.ageDays != null ? `${application.ageDays} days` : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-3.5">
                <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
            {documents.length ? (
              <ul className="mt-3 space-y-2">
                {documents.map((document) => (
                  <li
                    key={document.name + document.size}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/70 px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <FileText className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">{document.name}</span>
                      <span className="block text-xs text-slate-500">
                        {document.source} · {document.size}
                      </span>
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        document.review === "Pending" ? "text-amber-600" : document.review === "Reviewed" ? "text-emerald-600" : "text-slate-500"
                      }`}
                    >
                      {document.review}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No documents yet.</p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900">History</h3>
            {history.length ? (
              <ol className="relative mt-4 space-y-5 border-l border-slate-200 pl-5">
                {history.map((entry) => (
                  <li key={entry.timestamp + entry.event} className="relative">
                    <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-violet-500 ring-2 ring-violet-100" aria-hidden />
                    <p className="text-sm font-medium text-slate-900">{entry.event}</p>
                    <p className="text-xs text-slate-500">
                      {entry.timestamp} · {entry.actor}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No recorded events.</p>
            )}
          </section>
        </div>
      )}
    </SlideOver>
  );
}
