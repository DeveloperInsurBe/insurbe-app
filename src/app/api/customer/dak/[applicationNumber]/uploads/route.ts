import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { dakCustomerPortalEnabled, findCustomerDakCase } from "@/lib/dak/customer";
import { createDakUploadUrl } from "@/lib/dak/documents";
import { DAK_MAX_UPLOAD_BYTES, DAK_UPLOAD_TYPES } from "@/lib/dak/statuses";

/**
 * Customer reply, step 1: a one-time URL the browser uploads a file to directly.
 * Only while DAK is waiting for information from this customer.
 */
export async function POST(req: Request, context: { params: Promise<{ applicationNumber: string }> }) {
  if (!dakCustomerPortalEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { applicationNumber } = await context.params;
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const type = String(body?.type || "");
    const size = Number(body?.size) || 0;

    if (!name || !(DAK_UPLOAD_TYPES as readonly string[]).includes(type) || size <= 0 || size > DAK_MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Please upload a PDF, JPG or PNG of at most 10 MB." }, { status: 400 });
    }

    const item = await findCustomerDakCase(session.user.email, decodeURIComponent(applicationNumber));
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.status !== "Information Required") {
      return NextResponse.json({ error: "DAK is not waiting for information on this application." }, { status: 409 });
    }

    return NextResponse.json(await createDakUploadUrl(item.id, name));
  } catch (error) {
    console.error("CUSTOMER DAK UPLOAD URL ERROR:", error);
    return NextResponse.json({ error: "Could not prepare the upload" }, { status: 500 });
  }
}
