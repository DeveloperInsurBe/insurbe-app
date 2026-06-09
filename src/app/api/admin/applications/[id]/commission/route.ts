import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set([
  "Pending",
  "Approved",
  "Rejected",
  "Paid",
  "Not Eligible",
]);

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const commissionStatus = String(body?.commissionStatus || "").trim();

    if (!commissionStatus || !ALLOWED_STATUSES.has(commissionStatus)) {
      return NextResponse.json(
        { error: "Invalid commission status" },
        { status: 400 },
      );
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { commissionStatus },
      select: {
        id: true,
        commissionStatus: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update commission status" },
      { status: 500 },
    );
  }
}
