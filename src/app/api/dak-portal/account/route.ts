import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { prisma } from "@/lib/prisma";

/** Updates the reviewer's name shown in the activity log. */
export async function PATCH(req: Request) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const firstName = String(body?.firstName || "").trim().slice(0, 80);
  const lastName = String(body?.lastName || "").trim().slice(0, 80);
  if (!firstName) return NextResponse.json({ error: "Please enter your first name." }, { status: 400 });

  await prisma.user.update({ where: { id: reviewer.id }, data: { firstName, lastName: lastName || null } });
  return NextResponse.json({ ok: true });
}

/** Changes the reviewer's password. */
export async function POST(req: Request) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");
  if (newPassword.length < 12) {
    return NextResponse.json({ error: "The new password must have at least 12 characters." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: reviewer.id }, select: { password: true } });
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return NextResponse.json({ error: "The current password is not correct." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: reviewer.id }, data: { password: await bcrypt.hash(newPassword, 10) } });
  return NextResponse.json({ ok: true });
}
