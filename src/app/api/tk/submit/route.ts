import { NextResponse } from "next/server";

import { submitTkApplication } from "@/app/providers/tk/submit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    /**
     * GET BODY
     */
    const body = await req.json();

    /**
     * CALL PROVIDER FUNCTION
     */
    const result =
      await submitTkApplication(body);

    /**
     * RETURN RESPONSE
     */
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(
      "TK ROUTE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "TK submission failed",

        error:
          error?.message ||
          "Unknown error",
      },
      { status: 500 },
    );
  }
}