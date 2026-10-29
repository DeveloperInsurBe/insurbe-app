import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { findDakCaseForAction } from "@/lib/dak/detail";
import { createDakUploadUrl } from "@/lib/dak/documents";
import { DAK_MAX_UPLOAD_BYTES, DAK_UPLOAD_TYPES, isDakFinal } from "@/lib/dak/statuses";

/**
 * Step 1 of a reviewer upload: a one-time URL the browser uploads the file to
 * directly (no serverless size limit). Step 2 registers it on the case.
 */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const type = String(body?.type || "");
    const size = Number(body?.size) || 0;

    if (!name || !(DAK_UPLOAD_TYPES as readonly string[]).includes(type) || size <= 0 || size > DAK_MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Upload a PDF, JPG or PNG of at most 10 MB." }, { status: 400 });
    }

    const item = await findDakCaseForAction(id);
    if (!item) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (isDakFinal(item.status)) {
      return NextResponse.json({ error: `The application is ${item.status} and can no longer be changed.` }, { status: 409 });
    }

    return NextResponse.json(await createDakUploadUrl(item.id, name));
  } catch (error) {
    console.error("DAK PORTAL UPLOAD URL ERROR:", error);
    return NextResponse.json({ error: "Could not prepare the upload" }, { status: 500 });
  }
}
