import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { orderId, pdfBase64 } = body;

    if (!orderId || !pdfBase64) {
      return NextResponse.json(
        { error: "Missing orderId or pdfBase64" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        orderId,
        pdfBase64,
        status: "pending_login",
      },
    });

    return NextResponse.json({
      success: true,
      applicationId: application.id,
    });
  } catch (error) {
    console.error("❌ Save application error:", error);

    return NextResponse.json(
      { error: "Failed to save application" },
      { status: 500 }
    );
  }
}