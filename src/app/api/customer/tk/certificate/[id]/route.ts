import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { customerTkCertificateUrl } from "@/lib/tk/certificate";

/** Downloads the customer's own TK provisional certificate through a short-lived link. */
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
    const url = await customerTkCertificateUrl(session.user.email, id);
    if (!url) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("TK CERTIFICATE DOWNLOAD ERROR:", error);
    return NextResponse.json({ error: "Could not open the certificate" }, { status: 500 });
  }
}
