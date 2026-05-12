import { submitDakApplication } from "@/app/providers/dak/submit";
import { NextResponse } from "next/server";



export async function POST(
  req: Request,
) {
  try {
    const body =
      await req.json();

    const result =
      await submitDakApplication(body);

    return NextResponse.json(result);
  } catch (error: any) {
  console.error(
    "DAK API ERROR:",
    error,
  );

  return NextResponse.json(
    {
      success: false,

      error:
        error?.message ||
        String(error),
    },
    {
      status: 500,
    },
  );
}
}