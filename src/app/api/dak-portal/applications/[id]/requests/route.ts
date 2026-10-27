import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { DakTransitionError, transitionDakCase } from "@/lib/dak/cases";
import { findDakCaseForAction } from "@/lib/dak/detail";
import { sendDakInfoRequestEmail } from "@/lib/dak/emails";
import { DAK_REQUEST_CATEGORIES, DAK_REQUEST_PRIORITIES } from "@/lib/dak/statuses";

const MAX_TEXT = 4000;

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const category = String(body?.category || "");
    const relatedField = String(body?.relatedField || "").trim().slice(0, 200);
    const message = String(body?.message || "").trim().slice(0, MAX_TEXT);
    const internalNote = String(body?.internalNote || "").trim().slice(0, MAX_TEXT);
    const priority = String(body?.priority || "Normal");
    const dueDateRaw = String(body?.dueDate || "");

    if (!(DAK_REQUEST_CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json({ error: "Please choose a request category." }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "Please write the message to the customer." }, { status: 400 });
    }
    if (!(DAK_REQUEST_PRIORITIES as readonly string[]).includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }
    let dueDate: Date | null = null;
    if (dueDateRaw) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDateRaw) || Number.isNaN(Date.parse(dueDateRaw))) {
        return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
      }
      // End of the due day in Germany, so "due today" is not overdue yet.
      dueDate = new Date(`${dueDateRaw}T21:59:59.000Z`);
    }

    const item = await findDakCaseForAction(id);
    if (!item) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const request = {
      category,
      relatedField: relatedField || null,
      message,
      internalNote: internalNote || null,
      dueDate,
      priority,
      createdById: reviewer.id,
    };
    await transitionDakCase({
      caseId: item.id,
      from: item.status,
      action: "request_info",
      actor: { type: "reviewer", name: reviewer.name, id: reviewer.id },
      event: `Information requested — ${relatedField || category}`,
      note: relatedField || category,
      data: { requests: { create: request } },
    });

    let emailSent = false;
    if (item.customer.email) {
      try {
        await sendDakInfoRequestEmail(item.customer, request);
        emailSent = true;
      } catch (error) {
        console.error("DAK PORTAL REQUEST EMAIL FAILED:", item.caseNumber, error);
      }
    }

    return NextResponse.json({ status: "Information Required", emailSent });
  } catch (error) {
    if (error instanceof DakTransitionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DAK PORTAL REQUEST ERROR:", error);
    return NextResponse.json({ error: "The request could not be sent" }, { status: 500 });
  }
}
