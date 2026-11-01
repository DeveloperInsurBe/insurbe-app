import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { dakCustomerPortalEnabled, findCustomerDakLetter } from "@/lib/dak/customer";
import { dakDocumentSignedUrl } from "@/lib/dak/documents";

/** Downloads the customer's own DAK membership letter through a short-lived link. */
export async function GET(_req: Request, context: { params: Promise<{ docId: string }> }) {
  if (!dakCustomerPortalEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { docId } = await context.params;
    const letter = await findCustomerDakLetter(session.user.email, docId);
    if (!letter) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.redirect(await dakDocumentSignedUrl(letter, true));
  } catch (error) {
    console.error("CUSTOMER DAK LETTER ERROR:", error);
    return NextResponse.json({ error: "Could not open the letter" }, { status: 500 });
  }
}
