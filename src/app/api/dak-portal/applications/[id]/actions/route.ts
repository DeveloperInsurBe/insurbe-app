import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { DakTransitionError, transitionDakCase } from "@/lib/dak/cases";
import { syncDakCommission } from "@/lib/dak/commission";
import { findDakCaseForAction } from "@/lib/dak/detail";
import { sendDakClosedEmail } from "@/lib/dak/emails";

// Request information and allocation have their own routes (they carry more data).
const ACTIONS = ["start_review", "approve", "cancel", "not_eligible"] as const;
type Action = (typeof ACTIONS)[number];

const MAX_TEXT = 4000;

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "") as Action;
    const note = String(body?.note || "").trim().slice(0, MAX_TEXT);
    const reason = String(body?.reason || "").trim().slice(0, MAX_TEXT);

    if (!ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    const closing = action === "cancel" || action === "not_eligible";
    if (closing && !reason) {
      return NextResponse.json({ error: "Please enter the reason for the customer." }, { status: 400 });
    }

    const item = await findDakCaseForAction(id);
    if (!item) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const result = await transitionDakCase({
      caseId: item.id,
      from: item.status,
      action,
      actor: { type: "reviewer", name: reviewer.name, id: reviewer.id },
      note: closing ? reason : note,
      data: closing ? { closedReason: reason } : undefined,
    });

    let emailSent: boolean | null = null;
    if (closing) {
      try {
        await syncDakCommission(item.id, result.to as "Cancelled" | "Not Eligible");
      } catch (error) {
        console.error("DAK PORTAL COMMISSION SYNC FAILED:", item.caseNumber, error);
      }

      emailSent = false;
      if (item.customer.email) {
        try {
          await sendDakClosedEmail(item.customer, result.to as "Cancelled" | "Not Eligible", reason);
          emailSent = true;
        } catch (error) {
          console.error("DAK PORTAL CLOSED EMAIL FAILED:", item.caseNumber, error);
        }
      }
    }

    return NextResponse.json({ status: result.to, emailSent });
  } catch (error) {
    if (error instanceof DakTransitionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DAK PORTAL ACTION ERROR:", error);
    return NextResponse.json({ error: "The action could not be completed" }, { status: 500 });
  }
}
