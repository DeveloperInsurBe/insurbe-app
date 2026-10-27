import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { DakTransitionError, transitionDakCase } from "@/lib/dak/cases";
import { syncDakCommission } from "@/lib/dak/commission";
import { findDakCaseForAction } from "@/lib/dak/detail";
import { saveDakDocument } from "@/lib/dak/documents";
import { sendDakActiveEmail } from "@/lib/dak/emails";
import { DAK_CATEGORIES, DAK_MAX_UPLOAD_BYTES } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";

const field = (form: FormData, name: string, max = 100) => String(form.get(name) || "").trim().slice(0, max);

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { reviewer, response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id } = await context.params;
    const form = await req.formData();
    const membershipNumber = field(form, "membershipNumber");
    const kvnr = field(form, "kvnr");
    const svnr = field(form, "svnr");
    const startDate = field(form, "startDate", 10);
    const contributionCategory = field(form, "contributionCategory");
    const letter = form.get("letter");

    if (!membershipNumber) {
      return NextResponse.json({ error: "Please enter the DAK membership number." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || Number.isNaN(Date.parse(startDate))) {
      return NextResponse.json({ error: "Please enter the confirmed start date." }, { status: 400 });
    }
    if (contributionCategory && !(DAK_CATEGORIES as readonly string[]).includes(contributionCategory)) {
      return NextResponse.json({ error: "Invalid member category" }, { status: 400 });
    }
    const file = letter instanceof File && letter.size > 0 ? letter : null;
    if (file && (file.type !== "application/pdf" || file.size > DAK_MAX_UPLOAD_BYTES)) {
      return NextResponse.json({ error: "The membership letter must be a PDF of at most 10 MB." }, { status: 400 });
    }

    const item = await findDakCaseForAction(id);
    if (!item) return NextResponse.json({ error: "Application not found" }, { status: 404 });

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

    const content = file ? Buffer.from(await file.arrayBuffer()) : null;
    let letterSaved: boolean | null = null;
    if (file && content) {
      try {
        const saved = await saveDakDocument({
          caseId: item.id,
          name: file.name || "Membership confirmation.pdf",
          mimeType: "application/pdf",
          content,
          source: "dak",
          uploadedBy: reviewer.name,
        });
        await prisma.dakDocument.update({
          where: { id: saved.id },
          data: { reviewStatus: "reviewed", reviewedBy: reviewer.name, reviewedAt: new Date() },
        });
        letterSaved = true;
      } catch (error) {
        letterSaved = false;
        console.error("DAK PORTAL LETTER UPLOAD FAILED:", item.caseNumber, error);
      }
    }

    let emailSent = false;
    if (item.customer.email) {
      try {
        await sendDakActiveEmail(
          item.customer,
          { membershipNumber, kvnr: kvnr || null, startDate },
          file && content ? { filename: file.name || "Membership confirmation.pdf", content } : undefined,
        );
        emailSent = true;
      } catch (error) {
        console.error("DAK PORTAL ACTIVE EMAIL FAILED:", item.caseNumber, error);
      }
    }

    return NextResponse.json({ status: "Active", emailSent, letterSaved });
  } catch (error) {
    if (error instanceof DakTransitionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DAK PORTAL ALLOCATION ERROR:", error);
    return NextResponse.json({ error: "The allocation could not be saved" }, { status: 500 });
  }
}
