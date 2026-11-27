import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { dakBulkUploadEnabled } from "@/lib/dak/bulk/config";
import { findDraftByInviteToken } from "@/lib/dak/bulk/invitations";
import { passwordProblem } from "@/lib/passwordReset";
import { prisma } from "@/lib/prisma";

/** Accounts that can take over a DAK draft (customers only). */
const isCustomerRole = (role: string | null | undefined) => !role || role === "user";

/**
 * A customer accepts a DAK bulk invitation:
 * - signed in with the invited email  -> the draft is linked to that account
 * - not signed in, no account yet     -> an account is created with their password
 * - not signed in, account exists     -> { needsSignIn: true } (they sign in, then accept)
 * The link works once: the token is cleared when the draft is linked.
 */
export async function POST(req: Request) {
  if (!dakBulkUploadEnabled()) return NextResponse.json({ error: "Not available" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const draft = await findDraftByInviteToken(typeof body?.token === "string" ? body.token : "");
  if (!draft) {
    return NextResponse.json({ error: "This invitation link is no longer valid." }, { status: 410 });
  }
  const email = draft.email.toLowerCase();

  const session = await getServerSession(authOptions);
  let userId: string | null = null;

  if (session?.user?.email) {
    if (session.user.email.toLowerCase() !== email) {
      return NextResponse.json(
        { error: "You are signed in with another email address. Please sign out and open the link again." },
        { status: 403 },
      );
    }
    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true, role: true } });
    if (!user || !isCustomerRole(user.role)) {
      return NextResponse.json({ error: "Please contact support@insurbe.com about this invitation." }, { status: 403 });
    }
    userId = user.id;
  } else {
    // Checked again here (not only when the page opened), in case the account was created meanwhile.
    const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } });
    if (existing) return NextResponse.json({ needsSignIn: true });

    if (body?.acceptTerms !== true) {
      return NextResponse.json({ error: "Please accept the terms and privacy policy." }, { status: 400 });
    }
    const problem = passwordProblem(body?.password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    try {
      const created = await prisma.user.create({
        data: {
          email,
          password: await bcrypt.hash(body.password, 10),
          role: "user",
          firstName: draft.firstName,
          lastName: draft.lastName,
        },
        select: { id: true },
      });
      userId = created.id;
    } catch {
      // Unique email: someone created the account a moment ago.
      return NextResponse.json({ needsSignIn: true });
    }
  }

  // Link once: only while the invitation is still open.
  const linked = await prisma.dakDraft.updateMany({
    where: { id: draft.id, acceptedAt: null, status: "invitation_sent" },
    data: { customerUserId: userId, acceptedAt: new Date(), status: "started", startedAt: new Date(), inviteTokenHash: null },
  });
  if (linked.count !== 1) {
    return NextResponse.json({ error: "This invitation link is no longer valid." }, { status: 410 });
  }

  return NextResponse.json({ ok: true, email, created: !session?.user?.email });
}
