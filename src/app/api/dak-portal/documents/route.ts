import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { applicantFromPayload } from "@/lib/dak/cases";
import { serializeDocument } from "@/lib/dak/detail";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    const documents = await prisma.dakDocument.findMany({
      orderBy: { createdAt: "desc" },
      include: { case: { select: { caseNumber: true, insuranceApplication: { select: { payload: true } } } } },
      take: 2000,
    });
    return NextResponse.json({
      documents: documents.map((document) => ({
        ...serializeDocument(document),
        applicationId: document.case.caseNumber,
        applicant: applicantFromPayload(document.case.insuranceApplication.payload).name,
      })),
    });
  } catch (error) {
    console.error("DAK PORTAL DOCUMENTS ERROR:", error);
    return NextResponse.json({ error: "Could not load documents" }, { status: 500 });
  }
}
