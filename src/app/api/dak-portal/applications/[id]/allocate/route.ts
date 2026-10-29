import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { DakTransitionError, transitionDakCase } from "@/lib/dak/cases";
import { syncDakCommission } from "@/lib/dak/commission";
import { findDakCaseForAction } from "@/lib/dak/detail";
import { DakUploadError, readDakDocument, registerDakUpload } from "@/lib/dak/documents";
import { sendDakActiveEmail } from "@/lib/dak/emails";
import { DAK_CATEGORIES, DAK_MAX_UPLOAD_BYTES, canDak } from "@/lib/dak/statuses";

const field = (body: Record<string, unknown>, name: string, max = 100) => String(body[name] || "").trim().slice(0, max);

/**
 * Confirms the insurance allocation and makes the case Active. The membership
 * letter is uploaded by the browser beforehand (see ../uploads) and passed as
 * letterPath.
 */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id } = await context.params;
    const body = ((await req.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
    const membershipNumber = field(body, "membershipNumber");
    const kvnr = field(body, "kvnr");
    const svnr = field(body, "svnr");
    const startDate = field(body, "startDate", 10);
    const contributionCategory = field(body, "contributionCategory");
    const letterPath = field(body, "letterPath", 500);
    const letterName = field(body, "letterName", 200) || "Membership confirmation.pdf";

    if (!membershipNumber) {
      return NextResponse.json({ error: "Please enter the DAK membership number." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || Number.isNaN(Date.parse(startDate))) {
      return NextResponse.json({ error: "Please enter the confirmed start date." }, { status: 400 });
    }
    if (contributionCategory && !(DAK_CATEGORIES as readonly string[]).includes(contributionCategory)) {
      return NextResponse.json({ error: "Invalid member category" }, { status: 400 });
    }

    const item = await findDakCaseForAction(id);
    if (!item) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (!canDak("allocate", item.status)) {
      return NextResponse.json({ error: `This action is not possible while the application is "${item.status}".` }, { status: 409 });
    }

    // Record the letter first, so a wrong file stops the allocation.
    const letter = letterPath
      ? await registerDakUpload({
          caseId: item.id,
          storagePath: letterPath,
          name: letterName,
          allowedTypes: ["application/pdf"],
          maxBytes: DAK_MAX_UPLOAD_BYTES,
          uploadedBy: reviewer.name,
        })
      : null;

    await transitionDakCase({
      caseId: item.id,
      from: item.status,
      action: "allocate",
      actor: { type: "reviewer", name: reviewer.name, id: reviewer.id },
      note: `Membership ${membershipNumber}`,
      data: {
        membershipNumber,
        kvnr: kvnr || null,
        svnr: svnr || null,
        confirmedStartDate: startDate,
        contributionCategory: contributionCategory || null,
      },
    });

    try {
      await syncDakCommission(item.id, "Active");
    } catch (error) {
      console.error("DAK PORTAL COMMISSION SYNC FAILED:", item.caseNumber, error);
    }

    let emailSent = false;
    if (item.customer.email) {
      try {
        const attachment = letter ? { filename: letter.name, content: await readDakDocument(letter) } : undefined;
        await sendDakActiveEmail(item.customer, { membershipNumber, kvnr: kvnr || null, startDate }, attachment);
        emailSent = true;
      } catch (error) {
        console.error("DAK PORTAL ACTIVE EMAIL FAILED:", item.caseNumber, error);
      }
    }

    return NextResponse.json({ status: "Active", emailSent });
  } catch (error) {
    if (error instanceof DakUploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof DakTransitionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DAK PORTAL ALLOCATION ERROR:", error);
    return NextResponse.json({ error: "The allocation could not be saved" }, { status: 500 });
  }
}
