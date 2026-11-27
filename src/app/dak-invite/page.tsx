import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { DRAFT_RETENTION_DAYS, dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { findDraftByInviteToken } from "@/lib/dak/bulk/invitations";
import { prisma } from "@/lib/prisma";
import InviteClient from "./InviteClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your DAK application | InsurBe", robots: { index: false, follow: false } };

/** Landing page of a DAK bulk invitation email. */
export default async function DakInvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  if (!dakBulkUploadEnabled()) notFound();

  const { token = "" } = await searchParams;
  const [draft, session] = await Promise.all([findDraftByInviteToken(token), getServerSession(authOptions)]);

  if (!draft) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f5fb] px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-gray-900">This link is no longer valid</h1>
          <p className="mt-2 text-sm text-gray-600">
            The invitation was already used or has expired. If you already started your application, you can continue it from
            your InsurBe dashboard.
          </p>
          <Link href="/login" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#820ad1] px-6 text-sm font-semibold text-white">
            Go to login
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Need help? <a href="mailto:support@insurbe.com" className="font-semibold text-[#820ad1]">support@insurbe.com</a>
          </p>
        </div>
      </main>
    );
  }

  const [partner, account] = await Promise.all([
    prisma.user.findUnique({ where: { id: draft.partnerUserId }, select: { companyName: true, firstName: true, lastName: true } }),
    prisma.user.findFirst({ where: { email: { equals: draft.email, mode: "insensitive" } }, select: { id: true } }),
  ]);
  const partnerName =
    partner?.companyName || [partner?.firstName, partner?.lastName].filter(Boolean).join(" ") || "An InsurBe partner";
  const signedInEmail = session?.user?.email?.toLowerCase() ?? null;

  return (
    <main className="bg-[#f7f5fb] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#820ad1]">DAK health insurance</p>
        <h1 className="mt-2 text-2xl font-black text-gray-900">Hello {draft.firstName}, let&apos;s finish your application</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          <b>{partnerName}</b> started a DAK application for you (reference <span className="font-mono">{draft.reference}</span>).
          You check the details, upload your documents and submit it yourself. <b>Nothing is sent to DAK before you submit.</b>
        </p>

        <InviteClient
          token={token}
          email={draft.email.toLowerCase()}
          hasAccount={!!account}
          signedInEmail={signedInEmail}
        />

        <details className="mt-6 rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
          <summary className="cursor-pointer font-semibold text-gray-800">Where does my data come from?</summary>
          <p className="mt-2">
            The partner who started your application shared your name, email address and the details they had with InsurBe
            GmbH, which is responsible for this data. We use it only to prepare your DAK application, at your request. You can
            correct everything before you submit. If you don&apos;t continue, it is deleted after {DRAFT_RETENTION_DAYS} days. To
            see, correct or delete your data, write to{" "}
            <a href="mailto:support@insurbe.com" className="font-semibold text-[#820ad1]">support@insurbe.com</a>. See our{" "}
            <Link href="/privacypolicy" className="font-semibold text-[#820ad1]">privacy policy</Link>.
          </p>
        </details>
      </div>
    </main>
  );
}
