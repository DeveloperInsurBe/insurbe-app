import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/authOptions";
import { normalizeMawsitaDocuments } from "@/lib/mawsitaDocuments";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set([
  "Purchased",
  "Pending Docs",
  "Cancelled",
  "On Hold",
]);

function parseStatus(input: unknown) {
  const value = String(input || "").trim();
  if (!value) return "Purchased";
  return ALLOWED_STATUSES.has(value) ? value : "Purchased";
}

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

async function resolveUserIdByEmail(email: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return user?.id || null;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = String(searchParams.get("status") || "").trim();
    const query = String(searchParams.get("q") || "")
      .trim()
      .toLowerCase();

    const rows = await prisma.mawsitaRecord.findMany({
      orderBy: { createdAt: "desc" },
      where: status && ALLOWED_STATUSES.has(status) ? { status } : undefined,
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
        createdByEmail: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const filtered = !query
      ? rows
      : rows.filter((row) => {
          const haystack = [
            row.customerName,
            row.email,
            row.phone || "",
            row.planName,
            row.planType || "",
            row.status,
            row.notes || "",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        });

    return NextResponse.json({ rows: filtered });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load Mawsita records" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    const customerName = String(body.customerName || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const planName = String(body.planName || "").trim();
    const phone = String(body.phone || "").trim();
    const planType = String(body.planType || "").trim();
    const startDate = String(body.startDate || "").trim();
    const endDate = String(body.endDate || "").trim();
    const notes = String(body.notes || "").trim();
    const status = parseStatus(body.status);

    const premiumRaw = String(body.premiumAmount || "").trim();
    const premiumAmount = premiumRaw ? Number.parseFloat(premiumRaw) : null;
    if (premiumRaw && !Number.isFinite(premiumAmount)) {
      return NextResponse.json(
        { error: "Premium amount must be a valid number" },
        { status: 400 },
      );
    }

    if (!customerName || !planName || !email) {
      return NextResponse.json(
        { error: "Name, email, and plan are required" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const documents = normalizeMawsitaDocuments(body.documents);
    const userId = await resolveUserIdByEmail(email);

    let row;
    try {
      row = await prisma.mawsitaRecord.create({
        data: {
          userId,
          customerName,
          email,
          phone: phone || null,
          planName,
          planType: planType || null,
          startDate: startDate || null,
          endDate: endDate || null,
          premiumAmount,
          status,
          notes: notes || null,
          documents,
          createdByAdminId: session.user.id || null,
          createdByEmail: session.user.email,
        },
      });
    } catch (createError) {
      if (!isMissingMawsitaUserIdColumn(createError)) throw createError;
      row = await prisma.mawsitaRecord.create({
        data: {
          customerName,
          email,
          phone: phone || null,
          planName,
          planType: planType || null,
          startDate: startDate || null,
          endDate: endDate || null,
          premiumAmount,
          status,
          notes: notes || null,
          documents,
          createdByAdminId: session.user.id || null,
          createdByEmail: session.user.email,
        },
      });
    }

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to create Mawsita record",
        details:
          process.env.NODE_ENV === "development"
            ? String((error as { message?: unknown } | null)?.message || "")
            : undefined,
      },
      { status: 500 },
    );
  }
}
