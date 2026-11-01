import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { DakTransitionError } from "@/lib/dak/cases";
import { dakTestToolsEnabled, findDakCaseForAction } from "@/lib/dak/detail";
import { recordCustomerResponse } from "@/lib/dak/responses";

/**
 * TEST ONLY (DAK_PORTAL_TEST_TOOLS=true): answers an open request as if the
 * customer had replied from their dashboard.
 */
export async function POST(req: Request, context: { params: Promise<{ id: string; requestId: string }> }) {
  if (!dakTestToolsEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id, requestId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const message = String(body?.response || "").trim().slice(0, 4000) || "Test response: the requested information was provided.";

    const item = await findDakCaseForAction(id);
    if (!item) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    await recordCustomerResponse({
      caseId: item.id,
      caseNumber: item.caseNumber,
      requestId,
      response: message,
      customerName: item.customer.name,
      note: "Test response",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof DakTransitionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DAK PORTAL TEST RESPONSE ERROR:", error);
    return NextResponse.json({ error: "Could not record the response" }, { status: 500 });
  }
}
