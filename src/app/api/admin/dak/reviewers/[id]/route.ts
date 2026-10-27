import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/adminAccess";
import { DAK_REVIEWER_DISABLED_ROLE, DAK_REVIEWER_ROLE } from "@/lib/dak/access";
import { generateReviewerPassword } from "@/lib/dak/reviewers";
import { prisma } from "@/lib/prisma";

/** Admin: reset password, disable or enable a DAK reviewer. */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user || (user.role !== DAK_REVIEWER_ROLE && user.role !== DAK_REVIEWER_DISABLED_ROLE)) {
    return NextResponse.json({ error: "Reviewer not found" }, { status: 404 });
  }

  if (action === "reset_password") {
    const password = generateReviewerPassword();
    await prisma.user.update({ where: { id }, data: { password: await bcrypt.hash(password, 10) } });
    return NextResponse.json({ password });
  }

  if (action === "disable" || action === "enable") {
    // Portal access re-checks the role on every request, so this applies at once.
    await prisma.user.update({
      where: { id },
      data: { role: action === "disable" ? DAK_REVIEWER_DISABLED_ROLE : DAK_REVIEWER_ROLE },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
