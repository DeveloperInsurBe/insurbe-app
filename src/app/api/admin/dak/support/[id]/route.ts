import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";

/** Admin: marks a DAK support message as resolved or open again. */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const status = String(body?.status || "");
  if (status !== "open" && status !== "resolved") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.dakSupportTicket.updateMany({ where: { id }, data: { status } });
  if (!updated.count) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  return NextResponse.json({ status });
}
