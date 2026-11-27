import Link from "next/link";
import { notFound } from "next/navigation";

import { getCountriesCollection } from "@/lib/countries";
import { dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { DECLARATIONS, DOCUMENT_KINDS } from "@/lib/dak/bulk/draftForm";
import { getCustomerDraft } from "@/lib/dak/bulk/draftAccess";
import { draftDocumentsOf, draftFormOf } from "@/lib/dak/bulk/draftServer";
import { prisma } from "@/lib/prisma";
import DraftFormClient from "./DraftFormClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Complete your DAK application | InsurBe", robots: { index: false, follow: false } };

async function countryNames(): Promise<string[]> {
  try {
    const data = await getCountriesCollection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[])
      .map((country) => country?.name?.common)
      .filter((name): name is string => typeof name === "string" && name.length > 0)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/** The customer completes a DAK application a partner prepared for them. */
export default async function DakDraftPage({ params }: { params: Promise<{ id: string }> }) {
  if (!dakBulkUploadEnabled()) notFound();
  const { id } = await params;
  const draft = await getCustomerDraft(id);

  if (!draft) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f7f5fb] px-4 py-16">
        <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-black text-gray-900">Application not available</h1>
          <p className="mt-2 text-sm text-gray-600">It was already submitted or is not linked to your account.</p>
          <Link href="/dashboard" className="mt-5 inline-flex h-11 items-center rounded-xl bg-[#820ad1] px-5 text-sm font-semibold text-white">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const [partner, countries] = await Promise.all([
    prisma.user.findUnique({ where: { id: draft.partnerUserId }, select: { companyName: true, firstName: true, lastName: true } }),
    countryNames(),
  ]);
  const partnerName = partner?.companyName || [partner?.firstName, partner?.lastName].filter(Boolean).join(" ") || "An InsurBe partner";

  return (
    <main className="bg-[#f7f5fb] px-3 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-semibold text-[#820ad1] hover:underline">
          ← Back to dashboard
        </Link>
        <div className="mt-3 rounded-2xl border border-[#f0e6fb] bg-gradient-to-br from-white via-[#faf7ff] to-[#f3e8ff] p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#820ad1]">DAK health insurance</p>
          <h1 className="mt-1 text-xl font-black text-gray-900 sm:text-2xl">Complete your application</h1>
          <p className="mt-1 text-sm text-gray-600">
            Prepared by <b>{partnerName}</b> · <span className="font-mono text-xs">{draft.reference}</span>. Please check every detail –
            your answers are saved automatically. Nothing is sent to DAK until you submit.
          </p>
        </div>

        <DraftFormClient
          draftId={draft.id}
          initialForm={draftFormOf(draft)}
          initialDocuments={draftDocumentsOf(draft)}
          countries={countries}
          documentKinds={DOCUMENT_KINDS.map((kind) => ({ ...kind }))}
          declarations={DECLARATIONS.map((declaration) => ({ ...declaration }))}
          submitError={draft.submitError}
        />
      </div>
    </main>
  );
}
