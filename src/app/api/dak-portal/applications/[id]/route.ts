import { NextResponse } from "next/server";

import { requireDakReviewer } from "@/lib/dak/access";
import { loadDakCaseDetail } from "@/lib/dak/detail";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireDakReviewer();
  if (response) return response;

  try {
    const { id } = await context.params;
    const application = await loadDakCaseDetail(id);
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    return NextResponse.json({ application });
  } catch (error) {
    console.error("DAK PORTAL APPLICATION ERROR:", error);
    return NextResponse.json({ error: "Could not load the application" }, { status: 500 });
  }
}
