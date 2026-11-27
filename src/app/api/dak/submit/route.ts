import { NextResponse } from "next/server";

import { runDakSubmission } from "@/lib/dak/submitFlow";

/** Public DAK form submission. The work is shared with bulk-upload drafts (lib/dak/submitFlow.ts). */
export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const { status, json } = await runDakSubmission(body);
    return NextResponse.json(json, { status });
  } catch (error) {
    console.error("DAK API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || String(error),
      },
      {
        status: 500,
      },
    );
  }
}
