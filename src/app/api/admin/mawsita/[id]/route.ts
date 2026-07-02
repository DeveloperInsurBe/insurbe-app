import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import {
  extractSupabaseRefs,
  normalizeMawsitaDocuments,
} from "@/lib/mawsitaDocuments";
import { prisma } from "@/lib/prisma";
import {
  getMawsitaBucketName,
  getSupabaseStorageAdmin,
} from "@/lib/supabaseStorageAdmin";

const ALLOWED_STATUSES = new Set([
  "Purchased",
  "Pending Docs",
  "Cancelled",
  "On Hold",
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
    const body = (await req.json()) as Record<string, unknown>;

    const isFullUpdate =
      "customerName" in body ||
      "email" in body ||
      "planName" in body ||
      "documents" in body ||
      "premiumAmount" in body;

    const customerName = String(body.customerName || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const planName = String(body.planName || "").trim();
    const phone = String(body.phone || "").trim();
    const planType = String(body.planType || "").trim();
    const startDate = String(body.startDate || "").trim();
    const endDate = String(body.endDate || "").trim();
    const status = String(body.status || "").trim();
    const notes = String(body.notes || "").trim();
    const premiumRaw = String(body.premiumAmount || "").trim();
    const premiumAmount = premiumRaw ? Number.parseFloat(premiumRaw) : null;

    if (status && !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!isFullUpdate) {
      const updated = await prisma.mawsitaRecord.update({
        where: { id },
        data: {
          status: status || undefined,
          notes: "notes" in body ? notes || null : undefined,
        },
        select: {
          id: true,
          status: true,
          notes: true,
          updatedAt: true,
        },
      });

      return NextResponse.json(updated);
    }

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

    const updated = await prisma.mawsitaRecord.update({
      where: { id },
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
      },
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
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update Mawsita record" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.mawsitaRecord.findUnique({
      where: { id },
      select: { documents: true },
    });

    await prisma.mawsitaRecord.delete({
      where: { id },
      select: { id: true },
    });

    const refs = extractSupabaseRefs(existing?.documents);
    if (refs.length) {
      try {
        const supabase = getSupabaseStorageAdmin();
        const bucket = getMawsitaBucketName();
        const storagePaths = refs
          .filter((item) => item.bucket === bucket)
          .map((item) => item.storagePath);

        if (storagePaths.length) {
          await supabase.storage.from(bucket).remove(storagePaths);
        }
      } catch (cleanupError) {
        console.error("Mawsita storage cleanup failed:", cleanupError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete Mawsita record" },
      { status: 500 },
    );
  }
}
