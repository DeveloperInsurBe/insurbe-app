import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/adminAccess";
import { dakDocumentSignedUrl } from "@/lib/dak/documents";
import { prisma } from "@/lib/prisma";

/** Admin: opens (or with ?download=1 downloads) a DAK document via a short-lived link. */
export async function GET(req: Request, context: { params: Promise<{ docId: string }> }) {
  if (!(await getCurrentAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { docId } = await context.params;
    const document = await prisma.dakDocument.findUnique({ where: { id: docId } });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const download = new URL(req.url).searchParams.get("download") === "1";
    return NextResponse.redirect(await dakDocumentSignedUrl(document, download));
  } catch (error) {
    console.error("ADMIN DAK DOCUMENT ERROR:", error);
    return NextResponse.json({ error: "Could not open the document" }, { status: 500 });
  }
}
