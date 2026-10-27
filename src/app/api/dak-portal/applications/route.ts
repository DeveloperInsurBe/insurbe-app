import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { ensureDakCases, listInclude, serializeListRow } from "@/lib/dak/cases";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    await ensureDakCases();
    const cases = await prisma.dakCase.findMany({ include: listInclude, orderBy: { submittedAt: "desc" } });
    const now = new Date();
    return NextResponse.json({ applications: cases.map((item) => serializeListRow(item, now)) });
  } catch (error) {
    console.error("DAK PORTAL APPLICATIONS ERROR:", error);
    return NextResponse.json({ error: "Could not load applications" }, { status: 500 });
  }
}
