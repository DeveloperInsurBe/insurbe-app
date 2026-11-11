import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/adminAccess";
import { isValidCommissionRate, MAX_COMMISSION_RATE } from "@/lib/commission";
import { prisma } from "@/lib/prisma";
import { generateInviteCode, generateTeamAdminPassword, TEAM_ADMIN_ROLE } from "@/lib/team/access";

/** Superadmin: creates a team admin. The password is returned once. */
export async function POST(req: Request) {
  if (!(await getCurrentAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();
  const firstName = String(body?.firstName || "").trim().slice(0, 80);
  const lastName = String(body?.lastName || "").trim().slice(0, 80);
  const commissionLimit = Number(body?.commissionLimit);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!firstName) {
    return NextResponse.json({ error: "Please enter the first name." }, { status: 400 });
  }
  if (!isValidCommissionRate(commissionLimit)) {
    return NextResponse.json(
      { error: `The commission limit must be a whole number between 0 and ${MAX_COMMISSION_RATE}.` },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { role: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: `An account with this email already exists (${existing.role ?? "user"}). Use another email.` },
      { status: 409 },
    );
  }

  const password = generateTeamAdminPassword();
  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      role: TEAM_ADMIN_ROLE,
      firstName,
      lastName: lastName || null,
      commissionLimit,
      inviteCode: generateInviteCode(),
    },
    select: { id: true, email: true },
  });

  return NextResponse.json({ id: user.id, email: user.email, password });
}
