import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/authOptions";
import { normalizeMawsitaDocuments } from "@/lib/mawsitaDocuments";
import { prisma } from "@/lib/prisma";
import { getSupabaseStorageAdmin } from "@/lib/supabaseStorageAdmin";

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const recordId = String(body.recordId || "").trim();
    const bucket = String(body.bucket || "").trim();
    const storagePath = String(body.storagePath || "").trim();

    if (!recordId || !bucket || !storagePath) {
      return NextResponse.json(
        { error: "Missing document reference" },
        { status: 400 },
      );
    }

    const normalizedEmail = session.user.email.trim().toLowerCase();
    const ownershipWhere = [
      ...(session.user.id ? [{ userId: session.user.id }] : []),
      { userId: null, email: normalizedEmail },
    ];

    let record;
    try {
      record = await prisma.mawsitaRecord.findFirst({
        where: {
          id: recordId,
          OR: ownershipWhere,
        },
        select: { documents: true },
      });
    } catch (findError) {
      if (!isMissingMawsitaUserIdColumn(findError)) throw findError;
      record = await prisma.mawsitaRecord.findFirst({
        where: {
          id: recordId,
          email: normalizedEmail,
        },
        select: { documents: true },
      });
    }

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const docs = normalizeMawsitaDocuments(record.documents);
    const canAccess = docs.some(
      (doc) =>
        doc.source === "supabase" &&
        doc.bucket === bucket &&
        doc.storagePath === storagePath,
    );

    if (!canAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const supabase = getSupabaseStorageAdmin();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: "Could not create signed URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate document URL" },
      { status: 500 },
    );
  }
}
