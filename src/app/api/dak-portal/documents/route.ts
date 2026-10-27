import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { applicantFromPayload, caseStatus } from "@/lib/dak/cases";
import { serializeDocument } from "@/lib/dak/detail";
import { isDakFinal } from "@/lib/dak/statuses";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    const documents = await prisma.dakDocument.findMany({
      orderBy: { createdAt: "desc" },
      include: { case: { select: { caseNumber: true, status: true, insuranceApplication: { select: { payload: true } } } } },
      take: 2000,
    });
    return NextResponse.json({
      documents: documents.map((document) => ({
        ...serializeDocument(document),
        applicationId: document.case.caseNumber,
        applicant: applicantFromPayload(document.case.insuranceApplication.payload).name,
        /** Final application: the document can no longer be reviewed. */
        locked: isDakFinal(caseStatus(document.case.status)),
      })),
    });
  } catch (error) {
    console.error("DAK PORTAL DOCUMENTS ERROR:", error);
    return NextResponse.json({ error: "Could not load documents" }, { status: 500 });
  }
}
