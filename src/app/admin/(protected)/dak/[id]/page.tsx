import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Eye, FileText, Lock } from "lucide-react";

import { loadDakCaseDetail } from "@/lib/dak/detail";
import { isDakFinal } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";
import { euro, initials } from "../../adminUi";
import { DakStatusBadge, formatDate } from "../shared";

export const dynamic = "force-dynamic";

const SOURCE_LABEL = { customer: "Customer upload", insurbe: "InsurBe generated", dak: "DAK upload" } as const;
const REVIEW_LABEL = { pending: "Pending review", reviewed: "Reviewed", auto: "Auto" } as const;

function Card({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-gray-100">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 py-2 text-sm">
          <dt className="text-gray-500">{label}</dt>
          <dd className="break-words text-gray-900">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

const fileSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default async function AdminDakApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await loadDakCaseDetail(decodeURIComponent(id));
  if (!application) notFound();

  // Commission row of the partner/agent who referred this customer.
  const link = await prisma.dakCase.findUnique({
    where: { caseNumber: application.id },
    select: { insuranceApplicationId: true, insuranceApplication: { select: { applicationNumber: true } } },
  });
  const commission = link
    ? await prisma.application.findFirst({
        where: {
          product: "Public Health Insurance",
          orderId: {
            in: [link.insuranceApplicationId, link.insuranceApplication.applicationNumber].filter((value): value is string => !!value),
          },
        },
        select: { commission: true, commissionStatus: true, source: true, partnerId: true },
      })
    : null;

  const a = application.applicant;
  const locked = isDakFinal(application.status);

  return (
    <div className="min-w-0 space-y-4">
      <Link href="/admin/dak" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> DAK applications
      </Link>

      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#820ad1] to-[#a855f7] text-base font-black text-white">
            {initials(a.name)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-black text-gray-900 sm:text-xl">{a.name}</h1>
              <DakStatusBadge status={application.status} />
              {application.due === "overdue" && !locked ? (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">Overdue</span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              <span className="font-mono">{application.id}</span> · {a.category ?? a.reason ?? "—"} · submitted{" "}
              {formatDate(application.submittedAt, true)}
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          <Lock className="h-3.5 w-3.5" /> Read-only for admins
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          {application.closedReason && locked ? (
            <section className="rounded-2xl border border-red-200 bg-red-50/60 p-4 sm:p-5">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-red-700">
                {application.status === "Cancelled" ? "Cancellation reason" : "Reason for not eligible"} (sent to customer)
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-red-900">{application.closedReason}</p>
            </section>
          ) : null}

          {application.allocation ? (
            <Card title="Insurance allocation">
              <Rows
                rows={[
                  ["Membership No.", application.allocation.membershipNumber],
                  ["KVNR", application.allocation.kvnr],
                  ["SVNR", application.allocation.svnr],
                  ["Start date", formatDate(application.allocation.startDate)],
                  ["Contribution category", application.allocation.contributionCategory],
                ]}
              />
            </Card>
          ) : null}

          <Card title="Applicant">
            <Rows
              rows={[
                ["Email", a.email],
                ["Phone", a.phone],
                ["Date of birth", formatDate(a.birthDate)],
                ["Gender", a.gender],
                ["Nationality", a.nationality],
                ["Marital status", a.maritalStatus],
                ["Place / country of birth", [a.placeOfBirth, a.countryOfBirth].filter(Boolean).join(", ")],
                ["Passport number", a.passportNumber],
                ["Address", [a.street, [a.postalCode, a.city].filter(Boolean).join(" "), a.country].filter(Boolean).join(", ")],
                ["Reason / category", a.category ?? a.reason],
                ["Institution / employer", a.institution],
                ["Previously insured in", a.insuredBefore],
                ["Previous insurance", [a.previousInsuranceType, a.currentInsurer].filter(Boolean).join(" · ")],
                ["Family members", a.familyMembers],
                ["Notes", a.additionalInfo],
              ]}
            />
          </Card>

          <Card title={`Documents (${application.documents.length})`}>
            {application.documents.length === 0 ? (
              <p className="text-sm text-gray-500">No documents stored. Older applications only have them in the team email.</p>
            ) : (
              <ul className="space-y-2">
                {application.documents.map((document) => (
                  <li key={document.id} className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-[#820ad1]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900" title={document.name}>
                        {document.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {SOURCE_LABEL[document.source]} · {fileSize(document.size)} · {REVIEW_LABEL[document.reviewStatus]}
                      </p>
                    </div>
                    <a
                      href={`/api/admin/dak/documents/${document.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${document.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#820ad1]"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <a
                      href={`/api/admin/dak/documents/${document.id}?download=1`}
                      aria-label={`Download ${document.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#820ad1]"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card
            title="Commission"
            action={
              a.email ? (
                <Link
                  href={`/admin/applications?q=${encodeURIComponent(a.email)}&product=dak&stage=any`}
                  className="text-xs font-semibold text-[#820ad1] hover:underline"
                >
                  Open in Applications
                </Link>
              ) : null
            }
          >
            {commission ? (
              <Rows
                rows={[
                  ["Amount", euro.format(commission.commission)],
                  ["Status", commission.commissionStatus],
                  ["Came via", commission.source === "partner" || commission.source === "agent" ? commission.source : "Direct"],
                ]}
              />
            ) : (
              <p className="text-sm text-gray-500">No commission record for this application.</p>
            )}
            <p className="mt-2 text-[11px] text-gray-400">
              Updated automatically: Active → Approved, Cancelled / Not Eligible → Not Eligible (Paid and Rejected stay unchanged).
            </p>
          </Card>

          <Card title={`Information requests (${application.requests.length})`}>
            {application.requests.length === 0 ? (
              <p className="text-sm text-gray-500">No requests sent to the customer.</p>
            ) : (
              <ul className="space-y-3">
                {application.requests.map((request) => (
                  <li key={request.id} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {request.category}
                        {request.relatedField ? <span className="font-normal text-gray-500"> · {request.relatedField}</span> : null}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          request.status === "open" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {request.status === "open" ? "Awaiting customer" : "Customer responded"}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{request.message}</p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Sent {formatDate(request.createdAt, true)}
                      {request.dueDate ? ` · due ${formatDate(request.dueDate)}` : ""}
                    </p>
                    {request.internalNote ? (
                      <p className="mt-1 text-[11px] italic text-gray-500">Internal: {request.internalNote}</p>
                    ) : null}
                    {request.response ? (
                      <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-gray-800">
                        <span className="block text-[11px] font-semibold text-sky-700">
                          Response · {formatDate(request.respondedAt, true)}
                        </span>
                        {request.response}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Activity">
            <ol className="space-y-3">
              {[...application.events].reverse().map((event) => (
                <li key={event.id} className="relative border-l-2 border-gray-100 pl-3">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{event.actorName}</span>
                    <span className="text-gray-500"> · {event.event}</span>
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                    {formatDate(event.createdAt, true)}
                    {event.toStatus ? <DakStatusBadge status={event.toStatus} /> : null}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
