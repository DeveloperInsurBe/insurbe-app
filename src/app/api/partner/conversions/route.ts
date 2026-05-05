import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerCode = searchParams.get("partnerCode");

    if (!partnerCode) {
      return NextResponse.json([], { status: 200 });
    }

    const applications = await prisma.application.findMany({
      where: {
        partnerId: partnerCode, // 🔥 match partner
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching conversions" },
      { status: 500 }
    );
  }
}