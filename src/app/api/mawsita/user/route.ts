import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

function isMissingMawsitaUserIdColumn(error: unknown) {
  const message = String(
    (error as { message?: unknown } | null)?.message || "",
  ).toLowerCase();

  if (error instanceof Prisma.PrismaClientValidationError) {
    return message.includes("userid");
  }

  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return message.includes("userid");
  }

  if (!["P2022", "P2021"].includes(error.code)) {
    return message.includes("userid");
  }

  const meta = error.meta as { column?: unknown } | undefined;
  const column = String(meta?.column || "").toLowerCase();
  return column.includes("userid") || message.includes("userid");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const normalizedEmail = session.user.email.trim().toLowerCase();
    const ownershipWhere = [
      ...(session.user.id ? [{ userId: session.user.id }] : []),
      { userId: null, email: normalizedEmail },
    ];

    let rows;
    try {
      rows = await prisma.mawsitaRecord.findMany({
        where: { OR: ownershipWhere },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerName: true,
          email: true,
          phone: true,
          planName: true,
          planType: true,
          startDate: true,
          endDate: true,
          premiumAmount: true,
          status: true,
          notes: true,
          documents: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (findError) {
      if (!isMissingMawsitaUserIdColumn(findError)) throw findError;
      rows = await prisma.mawsitaRecord.findMany({
        where: { email: normalizedEmail },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerName: true,
          email: true,
          phone: true,
          planName: true,
          planType: true,
          startDate: true,
          endDate: true,
          premiumAmount: true,
          status: true,
          notes: true,
          documents: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({ rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load Mawista records" },
      { status: 500 },
    );
  }
}
