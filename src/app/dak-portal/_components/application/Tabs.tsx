"use client";

import { type ReactNode, useRef, useState } from "react";
import { Bot, CalendarDays, CircleCheck, Download, Eye, FileText, FlaskConical, MessageSquare, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import { DAK_MAX_UPLOAD_BYTES, DAK_UPLOAD_TYPES } from "@/lib/dak/statuses";
import {
  api,
  documentHref,
  fileKind,
  fmtDateTime,
  fmtLongDate,
  fmtSize,
  uploadToApplication,
  type DakCaseDetail,
  type DakDocumentDto,
} from "../../_lib/client";
import { Button, EmptyState, Panel } from "../ui";

/* -------------------------------------------------------------------------- */
/*                                   SHARED                                   */
/* -------------------------------------------------------------------------- */

function Card({ title, children, className = "" }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Panel padded className={className}>
      <h3 className="mb-5 text-[15px] font-semibold text-slate-900">{title}</h3>
      {children}
    </Panel>
  );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="space-y-4">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 text-sm">
          <dt className="shrink-0 text-slate-500">{label}</dt>
          <dd className="text-right font-medium text-slate-900">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Two-column key/value grid used on the Applicant Info tab. */
function Grid({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-12 gap-y-4 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 text-sm">
          <dt className="shrink-0 text-slate-500">{label}</dt>
          <dd className="text-right font-medium text-slate-900">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

const actorLabel = (event: DakCaseDetail["events"][number]) =>
  event.actorType === "customer" ? "Customer" : event.actorType === "system" ? "System" : event.actorName;

/* -------------------------------------------------------------------------- */
/*                                  OVERVIEW                                  */
/* -------------------------------------------------------------------------- */

export function OverviewTab({ application }: { application: DakCaseDetail }) {
  const { applicant, allocation } = application;
  const timeline = application.events.filter((event) => event.toStatus);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Contact">
          <Rows
            rows={[
              ["Email", applicant.email],
              ["Phone", applicant.phone],
              ["Nationality", applicant.nationality],
            ]}
          />
        </Card>
        <Card title="Address">
          <Rows
            rows={[
              ["Street", applicant.street],
              ["Postal / City", [applicant.postalCode, applicant.city].filter(Boolean).join(" ")],
              ["Country", applicant.country],
            ]}
          />
        </Card>
        <Card title="Insurance Request">
          <Rows
            rows={[
              ["Start date", applicant.requestedStartDate ? fmtLongDate(applicant.requestedStartDate) : null],
              ["Reason", applicant.reason],
              ["Institution / employer", applicant.institution],
              ["Current insurer", applicant.currentInsurer],
            ]}
          />
        </Card>
      </div>

      {application.closedReason && (application.status === "Cancelled" || application.status === "Not Eligible") && (
        <section className="rounded-2xl border border-rose-200/70 bg-rose-50/50 p-5">
          <h3 className="text-[15px] font-semibold text-rose-900">
            {application.status === "Cancelled" ? "Cancellation reason" : "Reason for not eligible"}
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm text-rose-900/80">{application.closedReason}</p>
          <p className="mt-2 text-xs text-rose-700/70">This reason was sent to the customer.</p>
        </section>
      )}

      <Card title="Status timeline">
        <ol className="relative space-y-6">
          {timeline.map((event, index) => (
            <li key={event.id} className="relative pl-8">
              {index < timeline.length - 1 && <span className="absolute left-[7px] top-5 h-[calc(100%+0.5rem)] w-px bg-violet-200" aria-hidden />}
              <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-[3px] border-violet-600 bg-white" aria-hidden />
              <p className="flex flex-wrap items-center gap-x-2 text-sm">
                <span className="font-semibold text-slate-900">{event.toStatus}</span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-500">{actorLabel(event)}</span>
                {event.note && <span className="text-slate-500">— {event.note}</span>}
              </p>
              <p className="mt-1 text-xs text-slate-400">{fmtDateTime(event.createdAt)}</p>
            </li>
          ))}
        </ol>
      </Card>

      {allocation && (
        <Card title="Insurance Allocation">
          <Grid
            rows={[
              ["Membership No.", allocation.membershipNumber],
              ["KVNR", allocation.kvnr],
              ["SVNR", allocation.svnr],
              ["Start date", fmtLongDate(allocation.startDate)],
              ["Contribution category", allocation.contributionCategory],
            ]}
          />
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               APPLICANT INFO                               */
/* -------------------------------------------------------------------------- */

export function ApplicantTab({ application }: { application: DakCaseDetail }) {
  const a = application.applicant;
  return (
    <div className="space-y-6">
      <Card title="Personal details">
        <Grid
          rows={[
            ["First name", a.firstName],
            ["Last name", a.lastName],
            ["Date of birth", a.birthDate ? fmtLongDate(a.birthDate) : null],
            ["Gender", a.gender],
            ["Nationality", a.nationality],
            ["Marital status", a.maritalStatus],
            ["Place of birth", a.placeOfBirth],
            ["Country of birth", a.countryOfBirth],
            ["Passport number", a.passportNumber],
          ]}
        />
      </Card>
      <Card title="Contact">
        <Grid
          rows={[
            ["Email", a.email],
            ["Phone", a.phone],
            ["Street", a.street],
            ["Postal code", a.postalCode],
            ["City", a.city],
            ["Country", a.country],
          ]}
        />
      </Card>
      <Card title="Employment / study">
        <Grid
          rows={[
            ["Occupation type", a.category ?? a.reason],
            ["Institution / employer", a.institution],
          ]}
        />
      </Card>
      <Card title="Insurance history">
        <Grid
          rows={[
            ["Previously insured in", a.insuredBefore],
            ["Previous insurance type", a.previousInsuranceType],
            ["Current insurer", a.currentInsurer],
            ["Requested start date", a.requestedStartDate ? fmtLongDate(a.requestedStartDate) : null],
          ]}
        />
      </Card>
      <Card title="Additional information">
        <Grid
          rows={[
            ["Include family members", a.familyMembers],
            ["Notes from the customer", a.additionalInfo],
          ]}
        />
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  DOCUMENTS                                 */
/* -------------------------------------------------------------------------- */

const SOURCE_GROUPS: { source: DakDocumentDto["source"]; title: string }[] = [
  { source: "customer", title: "Customer uploads" },
  { source: "insurbe", title: "InsurBe generated" },
  { source: "dak", title: "DAK uploads" },
];

export function ReviewPill({ review }: { review: DakDocumentDto["reviewStatus"] }) {
  if (review === "reviewed")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CircleCheck className="h-4 w-4" aria-hidden /> Reviewed
      </span>
    );
  if (review === "auto")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
        <Bot className="h-4 w-4" aria-hidden /> Auto
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden /> Pending review
    </span>
  );
}

export function DocumentLinks({ document }: { document: DakDocumentDto }) {
  const link = "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700";
  return (
    <>
      <a href={documentHref(document.id)} target="_blank" rel="noopener noreferrer" className={link} aria-label={`View ${document.name}`} title="View">
        <Eye className="h-4 w-4" aria-hidden />
      </a>
      <a href={documentHref(document.id, true)} className={link} aria-label={`Download ${document.name}`} title="Download">
        <Download className="h-4 w-4" aria-hidden />
      </a>
    </>
  );
}

export function DocumentsTab({
  application,
  locked,
  onChanged,
}: {
  application: DakCaseDetail;
  locked: boolean;
  onChanged: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > DAK_MAX_UPLOAD_BYTES) return toast.error("The file is larger than 10 MB.");
    if (!(DAK_UPLOAD_TYPES as readonly string[]).includes(file.type)) return toast.error("Upload a PDF, JPG or PNG file.");
    setUploading(true);
    try {
      const uploaded = await uploadToApplication(application.id, file);
      await api(`/applications/${encodeURIComponent(application.id)}/documents`, { method: "POST", json: uploaded });
      toast.success("Document uploaded");
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const markReviewed = async (document: DakDocumentDto) => {
    setReviewing(document.id);
    try {
      await api(`/documents/${document.id}`, { method: "PATCH" });
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="space-y-6">
      {!locked && (
        <div className="flex justify-end">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(event) => upload(event.target.files?.[0])}
          />
          <Button variant="primary" loading={uploading} onClick={() => inputRef.current?.click()}>
            {!uploading && <Upload className="h-4 w-4" aria-hidden />} Upload DAK document
          </Button>
        </div>
      )}

      {application.documents.length === 0 && (
        <Panel>
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No documents stored"
            text="Applications submitted before the portal went live only have their documents in the team email."
          />
        </Panel>
      )}

      {SOURCE_GROUPS.map(({ source, title }) => {
        const documents = application.documents.filter((document) => document.source === source);
        if (!documents.length) return null;
        return (
          <section key={source}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
            <ul className="space-y-3">
              {documents.map((document) => (
                <li
                  key={document.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <FileText className="h-5 w-5 shrink-0 text-violet-600" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900" title={document.name}>
                      {document.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {fileKind(document.mimeType)} · {fmtSize(document.size)} · {fmtLongDate(document.uploadedAt)}
                    </p>
                  </div>
                  <ReviewPill review={document.reviewStatus} />
                  {document.reviewStatus === "pending" && !locked && (
                    <Button onClick={() => markReviewed(document)} loading={reviewing === document.id} className="h-9">
                      Mark reviewed
                    </Button>
                  )}
                  <DocumentLinks document={document} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  REQUESTS                                  */
/* -------------------------------------------------------------------------- */

function RequestCard({
  request,
  testTools,
  onTestResponse,
  testing,
}: {
  request: DakCaseDetail["requests"][number];
  testTools: boolean;
  onTestResponse: () => void;
  testing: boolean;
}) {
  const open = request.status === "open";
  return (
    <li className={`rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${open ? "border-slate-200/70" : "border-sky-200/70"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900">{request.category}</span>
            {request.relatedField && (
              <>
                <span className="text-slate-400">›</span>
                <span className="text-slate-500">{request.relatedField}</span>
              </>
            )}
            {request.priority !== "Normal" && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">{request.priority}</span>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-500">{fmtDateTime(request.createdAt)}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            open ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"
          }`}
        >
          {open ? "Awaiting customer response" : "Customer responded"}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-violet-50/60 px-4 py-3">
        <p className="text-xs font-semibold text-slate-500">Message to customer</p>
        <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{request.message}</p>
      </div>

      {request.dueDate && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Due {fmtLongDate(request.dueDate)}
        </p>
      )}

      {request.internalNote && (
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs italic text-slate-500">
          <span className="not-italic font-semibold">Internal note:</span> {request.internalNote}
        </p>
      )}

      {request.response && (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-3">
          <p className="text-xs font-semibold text-sky-700">Customer response · {fmtDateTime(request.respondedAt)}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{request.response}</p>
        </div>
      )}

      {open && testTools && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <FlaskConical className="h-4 w-4" aria-hidden /> Test only — customers will reply from their dashboard later.
          </p>
          <Button onClick={onTestResponse} loading={testing} className="h-8 text-xs">
            Simulate customer reply
          </Button>
        </div>
      )}
    </li>
  );
}

export function RequestsTab({
  application,
  canRequest,
  onNewRequest,
  onChanged,
}: {
  application: DakCaseDetail;
  canRequest: boolean;
  onNewRequest: () => void;
  onChanged: () => void;
}) {
  const [testing, setTesting] = useState<string | null>(null);
  const open = application.requests.filter((request) => request.status === "open");
  const closed = application.requests.filter((request) => request.status !== "open");

  const simulate = async (requestId: string) => {
    setTesting(requestId);
    try {
      await api(`/applications/${encodeURIComponent(application.id)}/requests/${requestId}/test-response`, {
        method: "POST",
        json: {},
      });
      toast.success("Customer reply recorded (test)");
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setTesting(null);
    }
  };

  const list = (title: string, items: typeof open) =>
    items.length > 0 && (
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title} ({items.length})
        </h3>
        <ul className="space-y-4">
          {items.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              testTools={application.testTools}
              testing={testing === request.id}
              onTestResponse={() => simulate(request.id)}
            />
          ))}
        </ul>
      </section>
    );

  return (
    <div className="space-y-6">
      {canRequest && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={onNewRequest}>
            <Plus className="h-4 w-4" aria-hidden /> New request
          </Button>
        </div>
      )}
      {application.requests.length === 0 ? (
        <Panel>
          <EmptyState icon={<MessageSquare className="h-6 w-6" />} title="No information requests" text="Requests you send to the customer appear here." />
        </Panel>
      ) : (
        <>
          {list("Open", open)}
          {list("Closed", closed)}
        </>
      )}
    </div>
  );
}
